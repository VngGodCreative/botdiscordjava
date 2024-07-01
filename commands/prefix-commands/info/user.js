const { EmbedBuilder } = require('discord.js');
const { footer } = require('../../../config');

module.exports = {
    name: 'userinfo',
    description: '📋 Hiển thị thông tin về người dùng',
    category: 'info',
    usage: 'userinfo [@mention|userID]',

    async execute(message, args) {
        let user;
        if (args.length > 0) {
            try {
                user = await message.client.users.fetch(args[0].replace(/[<@!>]/g, ''));
            } catch (error) {
                return message.reply('Không tìm thấy người dùng với ID hoặc @mention này.');
            }
        } else {
            user = message.author;
        }

        const member = message.guild.members.cache.get(user.id);
        const createdAt = `${user.createdAt.toLocaleTimeString('vi-VN')} - ${user.createdAt.toLocaleDateString('vi-VN')}`;
        const joinedAt = member ? `${member.joinedAt.toLocaleTimeString('vi-VN')} - ${member.joinedAt.toLocaleDateString('vi-VN')}` : 'Không xác định';
        const roles = member ? member.roles.cache.filter(role => role.name !== '@everyone').map(role => `<@&${role.id}>`).join(', ') : 'Không có vai trò';

        const embed = new EmbedBuilder()
            .setColor(0x00AE86)
            .setTitle('📋 Thông tin người dùng được gọi')
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '👤 Tên Discord', value: `<@${user.id}>`, inline: true },
                { name: '🏷️ Tên Tag', value: `${user.tag}`, inline: true },
                { name: '🆔 ID', value: user.id, inline: true },
                { name: '📅 Ngày tạo tài khoản', value: createdAt, inline: true },
                { name: '🔗 Ngày tham gia server', value: joinedAt, inline: true },
                { name: '🏷️ Vai trò', value: roles, inline: false }
            )
            .setFooter({
                text: `${footer.text} - ${footer.version} | ${new Date().toLocaleTimeString('vi-VN')} - ${new Date().toLocaleDateString('vi-VN')}`,
                iconURL: footer.icon_url || message.client.user.displayAvatarURL()
            });

        message.channel.send({ embeds: [embed] });
    },
};