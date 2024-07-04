const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { footer } = require('../../../config');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('🔇 Rời khỏi kênh voice'),
    category: 'music',
    async execute(interaction) {
        const connection = getVoiceConnection(interaction.guild.id);

        if (!connection) {
            return interaction.reply({ content: '⚠️ Bot không ở trong kênh voice nào.', ephemeral: false });
        }

        connection.destroy();

        const embed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('🔇 Đã rời khỏi kênh voice')
            .setDescription(`Đã rời khỏi kênh voice thành công.`)
            .setFooter({
                text: `${footer.text} | ${footer.version}`,
                iconURL: interaction.client.user.displayAvatarURL(),
            });

        await interaction.reply({ embeds: [embed], ephemeral: false });
    },
};