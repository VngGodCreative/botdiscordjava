const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { footer } = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server_info')
        .setDescription('📜 Hiển thị thông tin về server hiện tại hoặc server theo ID')
        .addStringOption(option =>
            option.setName('server_id')
                .setDescription('ID của server (tuỳ chọn)')
                .setRequired(false)),
    category: 'info',

    async execute(interaction) {
        let guild;
        const serverID = interaction.options.getString('server_id');

        if (serverID) {
            guild = interaction.client.guilds.cache.get(serverID);

            if (!guild) {
                return interaction.reply(`Không tìm thấy server với ID: ${serverID}`);
            }
        } else {
            guild = interaction.guild;
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
                    .filter(channel => channel.type === 'GUILD_TEXT')
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

        const textChannels = guild.channels.cache.filter(channel => channel.type === 'GUILD_TEXT').size;
        const voiceChannels = guild.channels.cache.filter(channel => channel.type === 'GUILD_VOICE').size;
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
                { name: '🌐 Ngôn ngữ ưa thích', value: preferredLocale, inline: true },
                { name: '🔗 Link tham gia', value: inviteLink ? `[Click để tham gia](${inviteLink})` : 'Đang tạo link...', inline: false }
            )
            .setFooter({
                text: `${footer.text} ${footer.version} | ${new Date().toLocaleTimeString('vi-VN')} - ${new Date().toLocaleDateString('vi-VN')}`,
                iconURL: footer.icon_url || interaction.client.user.displayAvatarURL()
            });

        interaction.reply({ embeds: [embed] });
    },
};