const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const { footer } = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('🔇 Mute một thành viên trong một khoảng thời gian.')
        .addUserOption(option =>
            option.setName('thanhvien')
                .setDescription('Chọn thành viên cần mute')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('thoigian')
                .setDescription('Thời gian mute (ví dụ: 10m, 1h)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('lydo')
                .setDescription('Lý do mute')
                .setRequired(false)),
    category: 'admin',

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply('Bạn không có quyền mute thành viên.');
        }

        const user = interaction.options.getMember('thanhvien');
        const time = interaction.options.getString('thoigian');
        const reason = interaction.options.getString('lydo') || 'Không có lý do';

        if (!user) {
            return interaction.reply('Không tìm thấy thành viên.');
        }

        const milliseconds = ms(time);
        if (!milliseconds) {
            return interaction.reply('Vui lòng chỉ định thời gian hợp lệ (ví dụ: 10m, 1h).');
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
                    .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url || interaction.client.user.displayAvatarURL()});
                interaction.reply({ embeds: [embed] });
            })
            .catch(error => {
                console.error(error);
                interaction.reply('Đã xảy ra lỗi khi mute thành viên.');
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