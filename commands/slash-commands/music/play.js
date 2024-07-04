const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const scdl = require('soundcloud-downloader').default;
const spotifyURI = require('spotify-uri');
const { EmbedBuilder } = require('discord.js');
const { footer, spotifyClientId, spotifyClientSecret, youtubeApiKey } = require('../../../config');
const youtubeSearch = require('yt-search');

const queue = new Map();

async function getFetch() {
    const fetchModule = await import('node-fetch');
    return fetchModule.default;
}

// Function to get Spotify track details using Spotify API
async function getSpotifyTrack(url) {
    const fetch = await getFetch();
    const trackId = spotifyURI.parse(url).id;

    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(spotifyClientId + ':' + spotifyClientSecret).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ grant_type: 'client_credentials' })
    });

    const tokenData = await tokenResponse.json();
    const token = tokenData.access_token;

    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch Spotify track data');
    }

    const data = await response.json();
    return data;
}

// Function to search for a YouTube video
async function searchYouTube(query) {
    const searchResults = await youtubeSearch(query);
    return searchResults.videos.length > 0 ? searchResults.videos[0] : null;
}

const play = async (guild, song, interaction = null) => {
    const serverQueue = queue.get(guild.id);
    if (!song) {
        // Do not destroy the connection, just return
        return;
    }

    let resource;
    try {
        if (ytdl.validateURL(song.url)) {
            const stream = ytdl(song.url, { filter: 'audioonly' });
            resource = createAudioResource(stream);
        } else if (scdl.isValidUrl(song.url) && song.url.includes('soundcloud.com')) {
            const stream = await scdl.downloadFormat(song.url, scdl.FORMATS.OPUS);
            resource = createAudioResource(stream);
        } else if (song.url.match(/\.(mp3|wav|flac|ogg)$/i)) {
            resource = createAudioResource(song.url);
        } else if (song.url.includes('spotify.com/track')) {
            const info = await getSpotifyTrack(song.url);
            if (!info.preview_url) {
                // Search for the song on YouTube
                const youtubeResult = await searchYouTube(`${info.name} ${info.artists.map(artist => artist.name).join(' ')}`);
                if (!youtubeResult) {
                    throw new Error('Preview URL not available for this Spotify track and no alternative found on YouTube');
                }
                const stream = ytdl(youtubeResult.url, { filter: 'audioonly' });
                resource = createAudioResource(stream);
                song.url = youtubeResult.url; // Update song URL to YouTube
                song.title = youtubeResult.title; // Update song title to YouTube result
            } else {
                resource = createAudioResource(info.preview_url);
            }
        } else if (song.url.includes('cdn.discordapp.com')) {
            resource = createAudioResource(song.url);
        } else {
            console.error('Unsupported URL format.');
            return;
        }

        serverQueue.player.play(resource);

        serverQueue.player.on(AudioPlayerStatus.Idle, () => {
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0], interaction);
        });

        serverQueue.player.on('error', error => {
            console.error(`Error in player: ${error.message}`);
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0], interaction);
        });

        if (interaction) {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`🎵 Đang phát: [${song.title}](${song.url})`)
                .setDescription(`**Nghệ sĩ:** 👤 ${song.artist}\n**Độ dài:** ⏰ ${song.duration}`)
                .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url });

            if (song.thumbnail) {
                embed.setImage(song.thumbnail);
            }

            interaction.editReply({ embeds: [embed] });
        }
    } catch (error) {
        console.error(`Error in play function: ${error.message}`);
        if (interaction) {
            interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Lỗi')
                    .setDescription(`Không thể phát bài hát: [${song.title}](${song.url}). ${error.message}`)
                    .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url })]
            });
        }
        if (serverQueue) {
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0], interaction);
        }
    }
};

module.exports = {
    queue,
    play,
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('🎵 Phát một bài hát từ YouTube, SoundCloud, Spotify hoặc Discord URL')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('🔗 URL của bài hát')
                .setRequired(true)),
    async execute(interaction) {
        const url = interaction.options.getString('url');
        const channel = interaction.member.voice.channel;

        if (!channel) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Lỗi')
                    .setDescription('Bạn cần ở trong một kênh thoại để sử dụng lệnh này.')
                    .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url })],
                ephemeral: true
            });
        }

        await interaction.deferReply();

        const serverQueue = queue.get(interaction.guild.id);

        let title = '';
        let artist = '';
        let duration = '';
        let thumbnail = '';

        try {
            if (ytdl.validateURL(url)) {
                const info = await ytdl.getInfo(url);
                const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
                title = info.videoDetails.title;
                artist = info.videoDetails.author.name;
                duration = new Date(info.videoDetails.lengthSeconds * 1000).toISOString().substr(11, 8);
                thumbnail = info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url;
            } else if (scdl.isValidUrl(url) && url.includes('soundcloud.com')) {
                const info = await scdl.getInfo(url);
                title = info.title;
                artist = info.user.username;
                duration = new Date(info.duration).toISOString().substr(11, 8);
                thumbnail = info.artwork_url;
            } else if (url.match(/\.(mp3|wav|flac|ogg)$/i) || url.includes('cdn.discordapp.com')) {
                title = '🎵 Unknown Title';
                artist = '👤 Unknown Artist';
                duration = '⏰ Unknown Duration';
                thumbnail = '';
            } else if (url.includes('spotify.com/track')) {
                try {
                    const info = await getSpotifyTrack(url);
                    title = info.name;
                    artist = info.artists.map(artist => artist.name).join(', ');
                    duration = new Date(info.duration_ms).toISOString().substr(14, 5);
                    thumbnail = info.album.images[0].url;
                } catch (error) {
                    return interaction.editReply({
                        embeds: [new EmbedBuilder()
                            .setColor('#ff0000')
                            .setTitle('❌ Lỗi')
                            .setDescription('Không thể phát bài hát từ Spotify.')
                            .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url })]
                    });
                }
            } else {
                return interaction.editReply({
                    embeds: [new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('❌ Lỗi')
                        .setDescription('URL không hợp lệ. Vui lòng cung cấp URL YouTube, SoundCloud, Spotify hoặc Discord hợp lệ.')
                        .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url })]
                });
            }

            const song = {
                title,
                artist,
                duration,
                thumbnail,
                url
            };

            if (!serverQueue) {
                const queueContruct = {
                    textChannel: interaction.channel,
                    voiceChannel: interaction.member.voice.channel,
                    connection: null,
                    songs: [],
                    player: createAudioPlayer(),
                    playing: true
                };

                queue.set(interaction.guild.id, queueContruct);
                queueContruct.songs.push(song);

                try {
                    const connection = joinVoiceChannel({
                        channelId: channel.id,
                        guildId: interaction.guild.id,
                        adapterCreator: interaction.guild.voiceAdapterCreator,
                    });

                    connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
                        try {
                            await Promise.race([
                                entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                                entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                            ]);
                            // Seems to be reconnecting to a new channel - ignore disconnect
                        } catch (error) {
                            // Seems to be a real disconnect which shouldn't be recovered from
                            connection.destroy();
                        }
                    });

                    queueContruct.connection = connection;
                    connection.subscribe(queueContruct.player);

                    play(interaction.guild, queueContruct.songs[0], interaction);
                } catch (err) {
                    console.log(err);
                    queue.delete(interaction.guild.id);
                    return interaction.editReply({
                        embeds: [new EmbedBuilder()
                            .setColor('#ff0000')
                            .setTitle('❌ Lỗi')
                            .setDescription('Không thể kết nối vào kênh thoại.')
                            .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url })]
                    });
                }
            } else {
                serverQueue.songs.push(song);
                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle(`🎵 Đã thêm vào hàng đợi: [${title}](${url})`)
                    .setDescription(`**Nghệ sĩ:** 👤 ${artist}\n**Độ dài:** ⏰ ${duration}`)
                    .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url });

                if (thumbnail) {
                    embed.setImage(thumbnail);
                }

                return interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            console.error(error);
            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Lỗi')
                    .setDescription('Đã xảy ra lỗi khi cố gắng phát âm thanh. Vui lòng thử lại sau.')
                    .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url })]
            });
        }
    },
};