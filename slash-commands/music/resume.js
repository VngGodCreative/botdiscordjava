const { SlashCommandBuilder } = require('@discordjs/builders');
const { getVoiceConnection, AudioPlayerStatus } = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js'); // Corrected import
const { footer } = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('▶️ Tiếp tục phát nhạc đang tạm dừng'),
    async execute(interaction) {
        const connection = getVoiceConnection(interaction.guild.id);

        if (!connection) {
            return interaction.reply('Tôi không kết nối với một kênh thoại nào.');
        }

        const player = connection.state.subscription.player;

        if (player.state.status === AudioPlayerStatus.Paused) {
            player.unpause();

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('▶️ Nhạc đã được tiếp tục phát')
                .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url || interaction.client.user.displayAvatarURL() });

            return interaction.reply({ embeds: [embed] });
        } else {
            return interaction.reply('Không có nhạc đang tạm dừng ngay bây giờ.');
        }
    },
};