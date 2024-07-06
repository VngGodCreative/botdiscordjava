const { SlashCommandBuilder } = require('@discordjs/builders');
const { errorChannelId, footer } = require('../../../config');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('📢 Báo cáo lỗi tới kênh quản trị')
        .addStringOption(option =>
            option.setName('error')
                .setDescription('📝 Nội dung báo cáo lỗi')
                .setRequired(true)),
    category: 'general',

    async execute(interaction) {
        const errorChannel = interaction.client.channels.cache.get(errorChannelId);

        if (!errorChannel) {
            return interaction.reply({ content: '❌ Không tìm thấy kênh báo cáo lỗi.', ephemeral: true });
        }

        const errorMessage = interaction.options.getString('error');

        // Generate an invite link
        let inviteLink;
        const filePath = path.join(__dirname, '../../../data/invite_link.json');
        let inviteData = {};

        // Load existing invite data
        if (fs.existsSync(filePath)) {
            inviteData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }

        try {
            const invites = await interaction.guild.invites.fetch();
            const existingInvite = invites.find(invite => invite.maxAge === 0);

            if (existingInvite) {
                inviteLink = existingInvite.url;
            } else {
                const invite = await interaction.channel.createInvite({ maxAge: 0, maxUses: 0, unique: true });
                inviteLink = invite.url;
            }

            // Save the invite link to a JSON file
            inviteData[interaction.guild.id] = inviteLink;
            fs.writeFileSync(filePath, JSON.stringify(inviteData, null, 2));
        } catch (error) {
            console.error('Error creating invite link:', error);
            return interaction.reply({ content: '❌ Không thể tạo link tham gia server.', ephemeral: true });
        }

        const reportEmbed = {
            color: 0xff0000,
            title: '🛑 Báo cáo lỗi BOT',
            fields: [
                { name: '👤 Tên người gửi', value: interaction.user.username, inline: true },
                { name: '🏷️ Tag Discord', value: `<@${interaction.user.id}>`, inline: true },
                { name: '🆔 ID user', value: interaction.user.id, inline: true },
                { name: '🌐 Tên server', value: interaction.guild.name, inline: true },
                { name: '🆔 ID server', value: interaction.guild.id, inline: true },
                { name: '🔗 Link tham gia server', value: `[Click để tham gia nhóm](${inviteLink})`, inline: true },
                { name: '📝 Nội dung báo cáo lỗi', value: errorMessage, inline: false }
            ],
            author: {
                name: interaction.user.tag,
                icon_url: interaction.user.displayAvatarURL()
            },
            timestamp: new Date(),
            footer: {
                text: `Được gửi bởi ${interaction.user.username} | ${footer.version}`,
                icon_url: footer.icon_url || interaction.client.user.displayAvatarURL(),
            },
        };

        await errorChannel.send({ embeds: [reportEmbed] });
        await interaction.reply({ content: '✅ Lỗi của bạn đã được báo cáo.', ephemeral: false });
    },
};