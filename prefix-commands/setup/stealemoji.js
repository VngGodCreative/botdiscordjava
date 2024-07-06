const { EmbedBuilder } = require('discord.js');
const { footer } = require('../../../config');

module.exports = {
    name: 'stealemoji',
    description: '🖼️ Cướp emoji từ link hoặc emoji người dùng cung cấp.',
    usage: '<name> <emoji|link>',
    category: 'setup',
    permissions: ['ADMINISTRATOR'],  // Quyền admin

    async execute(message, args) {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            const noPermEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Truy cập bị từ chối')
                .setDescription('Bạn không có quyền sử dụng lệnh này.')
                .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url || message.client.user.displayAvatarURL() });

            return message.reply({ embeds: [noPermEmbed] });
        }

        const name = args[0];
        const input = args[1];

        if (!name || !input) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🚫 Thiếu Thông Tin')
                .setDescription('Vui lòng cung cấp tên và emoji hoặc link cho emoji.')
                .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url || message.client.user.displayAvatarURL() });

            return message.reply({ embeds: [errorEmbed] });
        }

        let imageUrl;
        const customEmoji = input.match(/<:\w+:(\d+)>/);
        if (customEmoji) {
            imageUrl = `https://cdn.discordapp.com/emojis/${customEmoji[1]}.png`;
        } else if (input.startsWith('http')) {
            imageUrl = input;
        } else {
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🚫 Lỗi Định Dạng')
                .setDescription('Emoji hoặc link không hợp lệ.')
                .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url || message.client.user.displayAvatarURL() });

            return message.reply({ embeds: [errorEmbed] });
        }

        message.guild.emojis.create({ attachment: imageUrl, name: name })
            .then(emoji => {
                const successEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('✅ Cướp Emoji Thành Công')
                    .setDescription(`Emoji ${emoji} đã được Cướp về server với tên \`${name}\`!`)
                    .setImage(imageUrl)
                    .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url || message.client.user.displayAvatarURL() });

                message.reply({ embeds: [successEmbed] });
            })
            .catch(error => {
                console.error(error);
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('🚫 Lỗi Cướp Emoji')
                    .setDescription('Có lỗi khi Cướp emoji vào server. ❌')
                    .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url || message.client.user.displayAvatarURL() });

                message.reply({ embeds: [errorEmbed] });
            });
    },
};