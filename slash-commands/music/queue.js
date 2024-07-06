const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { footer } = require('../../../config');
const { queue } = require('./play'); // Import queue từ play.js

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('🎵 Kiểm tra hàng đợi bài hát hiện tại và bài sắp tới'),
    async execute(interaction) {
        const serverQueue = queue.get(interaction.guild.id);

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🎵 Hàng đợi bài hát')
            .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url });

        if (!serverQueue || !serverQueue.songs.length) {
            embed.setDescription('❌ Không có bài hát nào đang phát.');
        } else {
            const currentSong = serverQueue.songs[0];
            const nextSong = serverQueue.songs[1];

            embed.setDescription(
                `**Hiện tại:** 🎶 [${currentSong.title}](${currentSong.url})\n**Nghệ sĩ:** 👤 ${currentSong.artist}\n**Độ dài:** ⏰ ${currentSong.duration}\n\n` +
                `**Tiếp theo:** 🎶 ${nextSong ? `[${nextSong.title}](${nextSong.url})` : 'Không có bài hát nào'}\n**Nghệ sĩ:** 👤 ${nextSong ? nextSong.artist : 'N/A'}\n**Độ dài:** ⏰ ${nextSong ? nextSong.duration : 'N/A'}`
            ).setThumbnail(currentSong.thumbnail);
        }

        await interaction.reply({ embeds: [embed] });
    },
};