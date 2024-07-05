const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const search = require('youtube-search');
const ytdl = require('ytdl-core');
const { youtubeApiKey, footer, ready } = require('../../../config'); // Import thêm biến ready
const { queue, play } = require('./play'); // Import queue và play từ play.js
const { joinVoiceChannel, createAudioPlayer } = require('@discordjs/voice');

const opts = {
    maxResults: 10, // Tăng giới hạn kết quả tìm kiếm lên 10 bài hát
    key: youtubeApiKey,
    type: 'video'
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription(`${ready.emojis.search} Tìm kiếm bài hát trên YouTube`) // Sử dụng emoji từ tệp cấu hình
        .addStringOption(option =>
            option.setName('keywords')
                .setDescription('Gõ từ khóa tìm kiếm vào đây để BOT tìm kiếm bài hát cho bạn')
                .setRequired(true)),
    async execute(interaction) {
        const keywords = interaction.options.getString('keywords');
        await interaction.deferReply(); // Defer the reply to avoid timeout

        search(keywords, opts, async (err, results) => {
            if (err) return console.log(err);

            if (!results.length) {
                return interaction.editReply('❌ Không tìm thấy bài hát nào.');
            }

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`${ready.emojis.search} Kết quả tìm kiếm cho từ khóa ${keywords}`) // Sử dụng emoji từ tệp cấu hình
                .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url || interaction.client.user.displayAvatarURL() });

            const row = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select_song')
                        .setPlaceholder('Chọn một bài hát')
                        .addOptions(results.map((result, index) => ({
                            label: `${index + 1}. ${result.title}`,
                            description: `Lựa chọn bài hát số ${index + 1}`,
                            value: index.toString()
                        })))
                );

            for (const [index, result] of results.entries()) {
                let artist = 'Unknown Artist';
                let duration = 'Unknown Duration';
                try {
                    const info = await ytdl.getInfo(result.link);
                    artist = info.videoDetails.author.name;
                    duration = new Date(info.videoDetails.lengthSeconds * 1000).toISOString().substr(11, 8);
                } catch (error) {
                    console.error('Failed to retrieve video details:', error);
                }
                embed.addFields({
                    name: `${index + 1}. ${artist} - ${duration}`,
                    value: `[${result.title}](${result.link})`,
                    inline: false,
                });
            }

            const message = await interaction.editReply({ embeds: [embed], components: [row], fetchReply: true });

            const filter = i => i.customId === 'select_song' && i.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async i => {
                await i.deferUpdate(); // Defer the update to avoid timeout

                const selected = parseInt(i.values[0], 10);
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

                        play(interaction.guild, queueContruct.songs[0], i); // Chuyển bài hát và chỉnh sửa tin nhắn tìm kiếm
                    } catch (err) {
                        console.log(err);
                        queue.delete(interaction.guild.id);
                        return i.followUp('❌ Không thể kết nối vào kênh thoại.');
                    }
                } else {
                    serverQueue.songs.push(song);
                }

                // Cập nhật lại tin nhắn với thông tin bài hát đã chọn
                const selectedEmbed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle(`🎵 Đã chọn bài hát số ${selected + 1}`)
                    .setDescription(`**Tên bài hát:** [${title}](${selectedSong.link})\n**Nghệ sĩ:** 👤 ${artist}\n**Độ dài:** ⏰ ${duration}`)
                    .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url || interaction.client.user.displayAvatarURL() });

                if (thumbnail) {
                    selectedEmbed.setImage(thumbnail);
                }

                await i.editReply({ embeds: [selectedEmbed], components: [] });
            });

            collector.on('end', async collected => {
                if (collected.size === 0) {
                    await message.delete();
                }
            });
        });
    },
};