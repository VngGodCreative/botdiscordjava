const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const { footer, ready } = require('../config');

const afkFilePath = path.join(__dirname, '../data/afk.json');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isCommand()) return;

        console.log(`${ready.colors.user}${ready.userprefix}\x1b[0m ${ready.colors.user}${interaction.user.tag} đã sử dụng slash /${interaction.commandName}\x1b[0m`);

        const command = interaction.client.slashCommands.get(interaction.commandName);
        if (!command) return;

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
        if (afkList[interaction.user.id]) {
            delete afkList[interaction.user.id];
            fs.writeFileSync(afkFilePath, JSON.stringify(afkList, null, 2), 'utf8');

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('🟢 Trạng thái AFK đã được gỡ bỏ')
                .setDescription(`Bạn đã quay trở lại và trạng thái AFK của bạn đã được gỡ bỏ.`)
                .setFooter({ text: `${footer.text} ${footer.version} | ${new Date().toLocaleTimeString('vi-VN')} - ${new Date().toLocaleDateString('vi-VN')}`, iconURL: footer.icon_url || interaction.client.user.displayAvatarURL() });
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Kiểm tra nếu có mention người dùng đang AFK
        if (interaction.mentions && interaction.mentions.members.size > 0) {
            interaction.mentions.members.forEach(member => {
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
                        .setFooter({ text: `${footer.text} ${footer.version} | ${new Date().toLocaleTimeString('vi-VN')} - ${new Date().toLocaleDateString('vi-VN')}`, iconURL: footer.icon_url || interaction.client.user.displayAvatarURL() });
                    interaction.reply({ embeds: [embed], ephemeral: true });
                }
            });
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (!interaction.replied) {
                await interaction.reply({ content: 'Có lỗi xảy ra khi thực thi lệnh!', ephemeral: true });
            }
        }
    },
};