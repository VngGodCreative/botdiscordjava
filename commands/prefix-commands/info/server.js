const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { footer } = require('../../../config');

module.exports = {
    name: 'serverinfo',
    description: '📜 Hiển thị thông tin về server hiện tại hoặc server theo ID',
    category: 'info',
    usage: '[serverID]',

    async execute(message, args) {
        let guild;

        if (args.length > 0) {
            const serverID = args[0];
            guild = message.client.guilds.cache.get(serverID);

            if (!guild) {
                return message.reply(`Không tìm thấy server với ID: ${serverID}`);
            }
        } else {
            guild = message.guild;
        }

        const inviteLinksPath = path.join(__dirname, '..', '..', '..', 'data', 'invite_link.json');
        let inviteLinks = {};

        if (fs.existsSync(inviteLinksPath)) {
            inviteLinks = JSON.parse(fs.readFileSync(inviteLinksPath, 'utf-8'));
        }

        let inviteLink = inviteLinks[guild.id];

        if (!inviteLink) {
            try {
                const channel = guild.channels.cache
                    .filter(channel => channel.type === 0) // 'GUILD_TEXT'
                    .first();

                if (channel) {
                    const invite = await channel.createInvite({ maxAge: 0 });
                    inviteLink = invite.url;
                    inviteLinks[guild.id] = inviteLink;
                    fs.writeFileSync(inviteLinksPath, JSON.stringify(inviteLinks, null, 2));
                } else {
                    inviteLink = 'Không có kênh văn bản hợp lệ để tạo lời mời.';
                }
            } catch (error) {
                console.error(error);
            }
        }

        const textChannels = guild.channels.cache.filter(channel => channel.type === 0).size; // 'GUILD_TEXT'
        const voiceChannels = guild.channels.cache.filter(channel => channel.type === 2).size; // 'GUILD_VOICE'
        const preferredLocale = guild.preferredLocale || 'Không xác định';
        const createdAt = `${guild.createdAt.toLocaleTimeString('vi-VN')} - ${guild.createdAt.toLocaleDateString('vi-VN')}`;
        const owner = await guild.fetchOwner();

        const embed = new EmbedBuilder()
            .setColor(0x00AE86)
            .setTitle(`📜 Thông tin về server: ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: '📅 Ngày tạo', value: createdAt, inline: true },
                { name: '🆔 ID server', value: guild.id, inline: true },
                { name: '👑 Chủ sở hữu', value: `<@${owner.user.id}>`, inline: true },
                { name: '💬 Số kênh văn bản', value: `${textChannels}`, inline: true },
                { name: '🔊 Số kênh thoại', value: `${voiceChannels}`, inline: true },
                { name: '🌐 Ngôn ngữ ưa thích', value: preferredLocale, inline: true },
                { name: '🔗 Link tham gia', value: inviteLink ? `[Click để tham gia](${inviteLink})` : 'Đang tạo link...', inline: false }
            )
            .setFooter({
                text: `${footer.text} ${footer.version} | ${new Date().toLocaleTimeString('vi-VN')} - ${new Date().toLocaleDateString('vi-VN')}`,
                iconURL: footer.icon_url || message.client.user.displayAvatarURL()
            });

        message.channel.send({ embeds: [embed] });
    },
};