const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const { footer, ready, prefix } = require('../config');

const afkFilePath = path.join(__dirname, '../data/afk.json');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        const client = message.client;

        // Đảm bảo tệp afk.json tồn tại và có nội dung hợp lệ
        if (!fs.existsSync(afkFilePath)) {
            fs.writeFileSync(afkFilePath, JSON.stringify({}, null, 2), 'utf8');
        }

        let afkList = {};
        try {
            afkList = JSON.parse(fs.readFileSync(afkFilePath, 'utf8'));
        } catch (error) {
            afkList = {};
            fs.writeFileSync(afkFilePath, JSON.stringify(afkList, null, 2), 'utf8');
        }

        // Kiểm tra nếu người dùng đang AFK và nhắn tin để loại bỏ trạng thái AFK
        if (afkList[message.author.id] && !message.content.startsWith(prefix) && !message.author.bot) {
            delete afkList[message.author.id];
            fs.writeFileSync(afkFilePath, JSON.stringify(afkList, null, 2), 'utf8');

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('🟢 Trạng thái AFK đã được gỡ bỏ')
                .setDescription(`Bạn đã quay trở lại và trạng thái AFK của bạn đã được gỡ bỏ.`)
                .setFooter({ text: `${footer.text} ${footer.version} | ${new Date().toLocaleTimeString('vi-VN')} - ${new Date().toLocaleDateString('vi-VN')}`, iconURL: footer.icon_url || message.client.user.displayAvatarURL() });
            message.reply({ embeds: [embed] });
            return; // Tránh phản hồi trùng lặp
        }

        // Kiểm tra nếu có mention người dùng đang AFK
        if (message.mentions.members.size > 0 && !message.author.bot) {
            message.mentions.members.forEach(member => {
                if (afkList[member.id]) {
                    const afkData = afkList[member.id];
                    const embed = new EmbedBuilder()
                        .setColor(0xFFA500)
                        .setTitle(`🚶‍♂️ ${member.user.username} đang AFK`)
                        .addFields(
                            { name: '👤 Tag Discord', value: `<@${member.id}>`, inline: true },
                            { name: '🆔 ID thành viên', value: member.id, inline: true },
                            { name: '📅 Thời gian', value: `${new Date(afkData.time).toLocaleTimeString('vi-VN')} - ${new Date(afkData.time).toLocaleDateString('vi-VN')}`, inline: true },
                            { name: '📢 Lý do', value: afkData.reason, inline: false }
                        )
                        .setFooter({ text: `${footer.text} ${footer.version} | ${new Date().toLocaleTimeString('vi-VN')} - ${new Date().toLocaleDateString('vi-VN')}`, iconURL: footer.icon_url || message.client.user.displayAvatarURL() });
                    message.reply({ embeds: [embed] });
                }
            });
        }

        if (!message.content.startsWith(prefix) || message.author.bot) return;

        console.log(`${ready.colors.user}${ready.userprefix}\x1b[0m ${ready.colors.user}${message.author.tag} đã sử dụng prefix ${message.content}\x1b[0m`);

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        if (!client.commands.has(commandName)) return;

        const command = client.commands.get(commandName);

        try {
            await command.execute(message, args);
        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🚫 Lỗi')
                .setDescription('Có lỗi xảy ra khi thực thi lệnh!');
            await message.reply({ embeds: [errorEmbed] });
        }
    },
};