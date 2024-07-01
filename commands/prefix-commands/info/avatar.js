const { EmbedBuilder } = require('discord.js');
const { footer } = require('../../../config');

module.exports = {
    name: 'avatar',
    description: '📷 Hiển thị avatar của bạn hoặc người dùng khác',
    usage: '$avatar [@user]',
    category: 'info',

    execute(message, args) {
        let user = message.mentions.users.first() || message.author;

        const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });
        const avatarLinks = `[JPG](${user.displayAvatarURL({ format: 'jpg', size: 1024 })}) | [PNG](${user.displayAvatarURL({ format: 'png', size: 1024 })}) | [WEBP](${user.displayAvatarURL({ format: 'webp', size: 1024 })})`;
        const gifLink = user.displayAvatarURL({ dynamic: true }).endsWith('.gif') ? ` | [GIF](${user.displayAvatarURL({ format: 'gif', size: 1024 })})` : '';

        const embed = new EmbedBuilder()
            .setColor('#0099ff') // Use hex color code
            .setTitle(`📷 Avatar của ${user.tag}`)
            .setDescription(`Tải ảnh đại diện: ${avatarLinks}${gifLink}`)
            .setImage(avatarURL)
            .setFooter({
                text: `${footer.text} - ${footer.version}`,
                iconURL: footer.icon_url || message.client.user.displayAvatarURL()
            });

        message.channel.send({ embeds: [embed] });
    },
};