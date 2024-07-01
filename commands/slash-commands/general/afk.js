const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { footer } = require('../../../config');

const afkFilePath = path.join(__dirname, '../../../data/afk.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('🚶‍♂️ Đặt trạng thái AFK')
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('📢 Lý do AFK')
                .setRequired(false)),
    category: 'general',

    async execute(interaction) {
        const reason = interaction.options.getString('reason') || 'Không có lý do cụ thể';
        const afkList = fs.existsSync(afkFilePath) ? JSON.parse(fs.readFileSync(afkFilePath, 'utf8')) : {};

        afkList[interaction.user.id] = {
            reason,
            time: Date.now()
        };

        fs.writeFileSync(afkFilePath, JSON.stringify(afkList, null, 2), 'utf8');

        const formatDate = (date) => {
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${hours}:${minutes}:${seconds} - ${day}/${month}/${year}`;
        };

        const now = new Date();
        const formattedDate = formatDate(now);

        const embed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle(`🚶‍♂️ ${interaction.user.tag} đã vào trạng thái AFK`)
            .addFields(
                { name: '👤 Tag Discord', value: `<@${interaction.user.id}>`, inline: true },
                { name: '🆔 ID thành viên', value: interaction.user.id, inline: true },
                { name: '📅 Thời gian', value: formattedDate, inline: true },
                { name: '📢 Lý do', value: reason, inline: false }
            )
            .setFooter({ text: `${footer.text} - ${footer.version} | ${formattedDate}`, iconURL: footer.icon_url || interaction.client.user.displayAvatarURL() });

        await interaction.reply({ embeds: [embed], ephemeral: false });
    }
};