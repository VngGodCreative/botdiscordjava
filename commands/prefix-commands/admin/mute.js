const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { footer } = require('../../../config');

module.exports = {
    name: 'mute',
    description: '🔇 Mute một thành viên trong một khoảng thời gian.',
    category: 'admin',
    execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply('Bạn không có quyền mute thành viên.');
        }

        const userId = args[0];
        const user = message.mentions.members.first() || message.guild.members.cache.get(userId);
        const time = args[1];
        const reason = args.slice(2).join(' ') || 'Không có lý do';

        if (!user) {
            return message.reply('Vui lòng đề cập hoặc nhập ID thành viên cần mute.');
        }

        if (!time) {
            return message.reply('Vui lòng chỉ định thời gian mute (ví dụ: 10m, 1h).');
        }

        const milliseconds = ms(time);
        if (!milliseconds) {
            return message.reply('Vui lòng chỉ định thời gian hợp lệ (ví dụ: 10m, 1h).');
        }

        user.timeout(milliseconds, reason)
            .then(() => {
                const embed = new EmbedBuilder()
                    .setColor(0xffa500)
                    .setTitle(`🔇 Thành viên ${user.user.username} đã bị mute`)
                    .addFields(
                        { name: '🆔 Tên Discord', value: `${user}`, inline: true },
                        { name: '🔢 ID Thành viên', value: `${user.id}`, inline: true },
                        { name: '⏰ Thời gian', value: formatTime(time), inline: true },
                        { name: '📄 Lý do', value: reason }
                    )
                    .setFooter({
                        text: `${footer.text} | ${footer.version}`,
                        iconURL: message.client.user.displayAvatarURL(),
                    });

                message.reply({ embeds: [embed] });
            })
            .catch(error => {
                console.error(error);
                message.reply('Đã xảy ra lỗi khi mute thành viên.');
            });
    },
};

function ms(time) {
    const match = time.match(/^(\d+)([smhd])$/);
    if (!match) return null;

    const amount = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
        case 's': return amount * 1000;
        case 'm': return amount * 60 * 1000;
        case 'h': return amount * 60 * 60 * 1000;
        case 'd': return amount * 24 * 60 * 60 * 1000;
        default: return null;
    }
}

function formatTime(time) {
    const match = time.match(/^(\d+)([smhd])$/);
    if (!match) return 'Không xác định';

    const amount = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
        case 's': return `${amount} giây`;
        case 'm': return `${amount} phút`;
        case 'h': return `${amount} giờ`;
        case 'd': return `${amount} ngày`;
        default: return 'Không xác định';
    }
}