const { SlashCommandBuilder } = require('@discordjs/builders');
const { getVoiceConnection, AudioPlayerStatus } = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js'); // Corrected import
const { footer } = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('⏸️ Tạm dừng nhạc đang phát'),
    async execute(interaction) {
        const connection = getVoiceConnection(interaction.guild.id);

        if (!connection) {
            return interaction.reply('Tôi không kết nối với một kênh thoại nào.');
        }

        const player = connection.state.subscription.player;

        if (player.state.status === AudioPlayerStatus.Playing) {
            player.pause();

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('⏸️ Nhạc đã được tạm dừng')
                .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url || interaction.client.user.displayAvatarURL() });

            return interaction.reply({ embeds: [embed] });
        } else {
            return interaction.reply('Không có nhạc đang phát ngay bây giờ.');
        }
    },
};