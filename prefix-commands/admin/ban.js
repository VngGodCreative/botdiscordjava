const { footer } = require('../../../config');

module.exports = {
    name: 'ban',
    description: '🚫 Cấm người dùng khỏi máy chủ',
    aliases: ['sut'],
    category: 'admin',
    async execute(message, args) {
        if (!message.member.permissions.has('BAN_MEMBERS')) {
            return message.reply('Bạn không có quyền cấm thành viên.');
        }

        const target = message.mentions.users.first();
        if (!target) {
            return message.reply('Vui lòng đề cập đến người dùng cần cấm.');
        }

        const member = message.guild.members.cache.get(target.id);
        if (!member) {
            return message.reply('Người dùng không tồn tại trong máy chủ này.');
        }

        const reason = args.slice(1).join(' ') || 'Không có lý do được cung cấp';

        try {
            await member.ban({ reason });
            message.channel.send({
                embeds: [
                    {
                        color: 0xff0000,
                        title: '🚫 Đã cấm thành công',
                        description: `Người dùng ${target.tag} đã bị cấm.\nLý do: ${reason}`,
                        footer: {
                            text: `${footer.text} - ${require('../config').version}`,
                            icon_url: message.client.user.displayAvatarURL(),
                        },
                    }
                ],
            });
        } catch (error) {
            console.error(error);
            message.reply('Có lỗi xảy ra khi cấm người dùng.');
        }
    },
};