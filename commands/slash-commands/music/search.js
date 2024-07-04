const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const search = require('youtube-search');
const ytdl = require('ytdl-core');
const { youtubeApiKey, footer } = require('../../../config');
const { queue, play } = require('./play'); // Import queue và play từ play.js
const { joinVoiceChannel, createAudioPlayer } = require('@discordjs/voice');

const opts = {
    maxResults: 5, // Giới hạn kết quả tìm kiếm tối đa là 5 bài hát
    key: youtubeApiKey,
    type: 'video'
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('🔎 Tìm kiếm bài hát trên YouTube')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Từ khóa tìm kiếm')
                .setRequired(true)),
    async execute(interaction) {
        const query = interaction.options.getString('query');

        search(query, opts, async (err, results) => {
            if (err) return console.log(err);

            if (!results.length) {
                return interaction.reply('❌ Không tìm thấy bài hát nào.');
            }

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('🔎 Kết quả tìm kiếm')
                .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url });

            const row = new ActionRowBuilder();

            results.forEach((result, index) => {
                embed.addFields({
                    name: `${index + 1}. ${result.title}`,
                    value: `[Link](${result.link})`,
                    inline: false,
                });

                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`select_${index}`)
                        .setLabel(`${index + 1}`)
                        .setStyle(ButtonStyle.Primary)
                );
            });

            await interaction.reply({ embeds: [embed], components: [row] });

            const filter = i => i.customId.startsWith('select_') && i.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async i => {
                const selected = parseInt(i.customId.split('_')[1], 10);
                const selectedSong = results[selected];

                let title = selectedSong.title;
                let artist = 'Unknown Artist';
                let duration = 'Unknown Duration';
                let thumbnail = selectedSong.thumbnails.default.url;

                try {
                    const info = await ytdl.getInfo(selectedSong.link);
                    artist = info.videoDetails.author.name;
                    duration = new Date(info.videoDetails.lengthSeconds * 1000).toISOString().substr(11, 8);
                    thumbnail = info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url;
                } catch (error) {
                    console.error('Failed to retrieve video details:', error);
                }

                const song = {
                    title,
                    url: selectedSong.link,
                    artist,
                    duration,
                    thumbnail
                };

                const serverQueue = queue.get(interaction.guild.id);

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

                        play(interaction.guild, queueContruct.songs[0], null); // Chỉ rõ rằng không cần gửi tin nhắn mới
                    } catch (err) {
                        console.log(err);
                        queue.delete(interaction.guild.id);
                        return i.reply('❌ Không thể kết nối vào kênh thoại.');
                    }
                } else {
                    serverQueue.songs.push(song);
                }

                const nowPlayingEmbed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle(`🎵 Đang phát: [${song.title}](${song.url})`)
                    .setDescription(`**Nghệ sĩ:** 👤 ${song.artist}\n**Độ dài:** ⏰ ${song.duration}`)
                    .setImage(song.thumbnail)
                    .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url });

                await i.update({ embeds: [nowPlayingEmbed], components: [] });
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.editReply({ components: [] });
                }
            });
        });
    },
};