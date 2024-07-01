const { EmbedBuilder } = require('discord.js');
const { footer } = require('../../../config');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    name: 'leave',
    description: 'Rời khỏi kênh voice',
    category: 'music',
    execute(message) {
        const connection = getVoiceConnection(message.guild.id);

        if (!connection) {
            return message.reply('Bot không ở trong kênh voice nào.');
        }

        connection.destroy();

        const embed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('🔇 Đã rời khỏi kênh voice')
            .setDescription(`Đã rời khỏi kênh voice thành công.`)
            .setFooter({
                text: `${footer.text} | ${footer.version}`,
                iconURL: message.client.user.displayAvatarURL(),
            });

        message.reply({ embeds: [embed] }).catch(console.error);
    },
};