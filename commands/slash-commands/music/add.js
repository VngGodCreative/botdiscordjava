const { SlashCommandBuilder } = require('@discordjs/builders');
const ytdl = require('ytdl-core');
const scdl = require('soundcloud-downloader').default;
const spotifyURI = require('spotify-uri');
const { EmbedBuilder } = require('discord.js');
const { footer } = require('../../../config');

// Function to get Spotify track details using a public API
async function getSpotifyTrack(url) {
    const trackId = spotifyURI.parse(url).id;
    const response = await fetch(`https://spotify-web-api-proxy-cors.vercel.app/track/${trackId}`);
    const data = await response.json();
    return data;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('🎵 Thêm một bài hát vào hàng đợi từ YouTube, SoundCloud, Spotify hoặc Discord URL')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('🔗 URL của bài hát')
                .setRequired(true)),
    async execute(interaction) {
        const url = interaction.options.getString('url');
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
            } else if (url.match(/\.(mp3|wav|flac|ogg)$/i)) {
                title = '🎵 Unknown Title';
                artist = '👤 Unknown Artist';
                duration = '⏰ Unknown Duration';
                thumbnail = '';
            } else if (url.includes('spotify.com/track')) {
                const info = await getSpotifyTrack(url);
                title = info.name;
                artist = info.artists.map(artist => artist.name).join(', ');
                duration = new Date(info.duration_ms).toISOString().substr(14, 5);
                thumbnail = info.album.images[0].url;
            } else {
                return interaction.reply('❌ URL không hợp lệ. Vui lòng cung cấp URL YouTube, SoundCloud, Spotify hoặc Discord hợp lệ.');
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
                        channelId: interaction.member.voice.channel.id,
                        guildId: interaction.guild.id,
                        adapterCreator: interaction.guild.voiceAdapterCreator,
                    });
                    queueContruct.connection = connection;
                    connection.subscribe(queueContruct.player);

                    play(interaction.guild, queueContruct.songs[0]);
                } catch (err) {
                    console.log(err);
                    queue.delete(interaction.guild.id);
                    return interaction.reply('❌ Không thể kết nối vào kênh thoại.');
                }
            } else {
                serverQueue.songs.push(song);
                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle(`🎵 Đã thêm vào hàng đợi: ${title}`)
                    .setDescription(`**Nghệ sĩ:** 👤 ${artist}\n**Độ dài:** ⏰ ${duration}`)
                    .setImage(thumbnail)
                    .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url });

                return interaction.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error(error);
            return interaction.reply('❌ Đã xảy ra lỗi khi cố gắng thêm âm thanh vào hàng đợi. Vui lòng thử lại sau.');
        }
    },
};