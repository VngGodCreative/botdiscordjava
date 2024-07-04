const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const { footer } = require('../../../config');

const afkFilePath = path.join(__dirname, '../../../data/afk.json');

function formatDateTime(date) {
    const pad = (n) => (n < 10 ? '0' + n : n);
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} - ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

module.exports = {
    name: 'afk',
    description: 'Đặt trạng thái AFK cho người dùng',
    category: 'general',
    execute(message, args) {
        const reason = args.join(' ') || 'Không có lý do cụ thể';
        const afkData = {
            reason,
            time: Date.now()
        };

        // Đọc dữ liệu AFK từ tệp
        let afkList = {};
        if (fs.existsSync(afkFilePath)) {
            afkList = JSON.parse(fs.readFileSync(afkFilePath, 'utf8'));
        }

        afkList[message.author.id] = afkData;

        // Ghi dữ liệu AFK vào tệp
        fs.writeFileSync(afkFilePath, JSON.stringify(afkList, null, 2), 'utf8');

        const embed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle(`🚶‍♂️ ${message.author.username} đã vào trạng thái AFK`)
            .addFields(
                { name: '👤 Tag Discord', value: `<@${message.author.id}>`, inline: true },
                { name: '🆔 ID thành viên', value: message.author.id, inline: true },
                { name: '📅 Thời gian', value: formatDateTime(new Date()), inline: true },
                { name: '📢 Lý do', value: reason, inline: false }
            )
            .setFooter({ text: `${footer.text} ${footer.version} | ${formatDateTime(new Date())}`, iconURL: footer.icon_url || message.client.user.displayAvatarURL() });

        message.reply({ embeds: [embed] });
    },
};