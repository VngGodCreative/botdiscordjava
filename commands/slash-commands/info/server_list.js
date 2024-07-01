const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { footer } = require('../../../config');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverlist')
        .setDescription('📜 Hiển thị danh sách các máy chủ mà bot đang tham gia'),
    category: 'info',

    async execute(interaction) {
        const client = interaction.client;
        const inviteLinksPath = path.join(__dirname, '..', '..', '..', 'data', 'invite_link.json');
        let inviteLinks = {};

        if (fs.existsSync(inviteLinksPath)) {
            inviteLinks = JSON.parse(fs.readFileSync(inviteLinksPath, 'utf-8'));
        }

        const serverList = [];
        for (const guild of client.guilds.cache.values()) {
            let inviteLink = inviteLinks[guild.id];

            if (!inviteLink) {
                const invites = await guild.invites.fetch();
                const invite = invites.find(inv => inv.maxAge === 0) || invites.first();

                if (invite) {
                    inviteLink = invite.url;
                } else {
                    const newInvite = await guild.invites.create(guild.channels.cache.filter(channel => channel.isText()).first(), { maxAge: 0 });
                    inviteLink = newInvite.url;
                }

                inviteLinks[guild.id] = inviteLink;
                fs.writeFileSync(inviteLinksPath, JSON.stringify(inviteLinks, null, 2));
            }

            const botCount = guild.members.cache.filter(member => member.user.bot).size;

            serverList.push({
                name: guild.name,
                id: guild.id,
                memberCount: guild.memberCount,
                botCount: botCount,
                roleCount: guild.roles.cache.size,
                inviteLink: inviteLink
            });
        }

        const maxPerPage = 5;
        let page = 0;
        const totalPages = Math.ceil(serverList.length / maxPerPage);

        const generateEmbed = (page) => {
            const start = page * maxPerPage;
            const end = start + maxPerPage;

            const description = serverList.slice(start, end).map((server, index) => (
                `**${start + index + 1}. 📜 Tên server:** ${server.name}\n` +
                `**🆔 ID server:** ${server.id}\n` +
                `**👥 Số lượng thành viên:** ${server.memberCount}\n` +
                `**🤖 Số lượng bot:** ${server.botCount}\n` +
                `**🏷️ Số lượng roles:** ${server.roleCount}\n` +
                `**🔗 Link tham gia:** [Click để tham gia](${server.inviteLink})\n`
            )).join('\n');

            return new EmbedBuilder()
                .setColor(0x00AE86)
                .setTitle('📜 Danh sách các máy chủ BOT đã tham gia')
                .setDescription(description)
                .setFooter({
                    text: `${footer.text} - ${footer.version} | ${new Date().toLocaleTimeString('vi-VN')} - ${new Date().toLocaleDateString('vi-VN')}`,
                    iconURL: footer.icon_url || client.user.displayAvatarURL()
                });
        };

        const row = () => new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('prev')
                    .setLabel('◀️ Trước')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === 0),
                new ButtonBuilder()
                    .setCustomId('page')
                    .setLabel(`Trang ${page + 1}/${totalPages}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('▶️ Sau')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === totalPages - 1)
            );

        const messageReply = await interaction.reply({ embeds: [generateEmbed(page)], components: [row()], fetchReply: true });

        const filter = (interaction) => {
            return ['prev', 'next'].includes(interaction.customId) && interaction.user.id === interaction.user.id;
        };

        const collector = messageReply.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', (interaction) => {
            if (interaction.customId === 'prev') {
                page--;
            } else if (interaction.customId === 'next') {
                page++;
            }

            interaction.update({
                embeds: [generateEmbed(page)],
                components: [row()]
            });
        });

        collector.on('end', () => {
            messageReply.edit({ components: [] });
        });
    },
};