const { errorChannelId, footer } = require('../../../config');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'report',
    description: 'Báo cáo lỗi tới kênh quản trị',
    category: 'general',
    async execute(message, args) {
        const errorChannel = message.client.channels.cache.get(errorChannelId);

        if (!errorChannel) {
            return message.reply('Không tìm thấy kênh báo cáo lỗi.');
        }

        const errorMessage = args.join(' ');
        if (!errorMessage) {
            return message.reply('Vui lòng cung cấp thông tin lỗi.');
        }

        // Generate an invite link
        let inviteLink;
        const filePath = path.join(__dirname, '../../../data/invite_link.json');
        let inviteData = {};

        // Load existing invite data
        if (fs.existsSync(filePath)) {
            inviteData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }

        try {
            const invites = await message.guild.invites.fetch();
            const existingInvite = invites.find(invite => invite.maxAge === 0);

            if (existingInvite) {
                inviteLink = existingInvite.url;
            } else {
                const invite = await message.channel.createInvite({ maxAge: 0, maxUses: 0, unique: true });
                inviteLink = invite.url;
            }

            // Save the invite link to a JSON file
            inviteData[message.guild.id] = inviteLink;
            fs.writeFileSync(filePath, JSON.stringify(inviteData, null, 2));
        } catch (error) {
            console.error('Error creating invite link:', error);
            return message.reply('Không thể tạo link tham gia server.');
        }

        const reportEmbed = {
            color: 0xff0000,
            title: '🛑 Báo cáo lỗi BOT',
            fields: [
                { name: '👤 Tên người gửi', value: message.author.username, inline: true },
                { name: '🏷️ Tag Discord', value: `<@${message.author.id}>`, inline: true },
                { name: '🆔 ID user', value: message.author.id, inline: true },
                { name: '🌐 Tên server', value: message.guild.name, inline: true },
                { name: '🆔 ID server', value: message.guild.id, inline: true },
                { name: '🔗 Link tham gia server', value: `[Click để tham gia nhóm](${inviteLink})`, inline: true },
                { name: '📝 Nội dung báo cáo lỗi', value: errorMessage, inline: false }
            ],
            author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL()
            },
            timestamp: new Date(),
            footer: {
                text: `Được gửi bởi ${message.author.username} | ${footer.version}`,
                icon_url: footer.icon_url || message.client.user.displayAvatarURL(),
            },
        };

        errorChannel.send({ embeds: [reportEmbed] });
        message.reply('Lỗi của bạn đã được báo cáo.');
    },
};