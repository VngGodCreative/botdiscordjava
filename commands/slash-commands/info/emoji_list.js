const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { footer } = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('emoji_list')
        .setDescription('📋 Hiển thị danh sách emoji trong server'),
    category: 'info',

    async execute(interaction) {
        const guild = interaction.guild;
        const emojis = Array.from(guild.emojis.cache.values());

        const maxPerPage = 5;
        let page = 0;
        const totalPages = Math.ceil(emojis.length / maxPerPage);

        const generateEmbed = (page) => {
            const start = page * maxPerPage;
            const end = start + maxPerPage;

            const description = emojis.slice(start, end).map((emoji, index) => (
                `**${start + index + 1}. ${emoji} Tên Emoji:** ${emoji.name}\n**ID Emoji:** ${emoji.id}`
            )).join('\n\n');

            return new EmbedBuilder()
                .setColor(0x00AE86)
                .setTitle(`📋 Danh sách emoji Server ${guild.name}`)
                .setDescription(description)
                .setFooter({
                    text: `${footer.text} - ${footer.version} | ${new Date().toLocaleTimeString('vi-VN')} - ${new Date().toLocaleDateString('vi-VN')}`,
                    iconURL: footer.icon_url || interaction.client.user.displayAvatarURL()
                });
        };

        const row = () => new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('first')
                    .setLabel('⏮️ Đầu')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === 0),
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
                    .setDisabled(page === totalPages - 1),
                new ButtonBuilder()
                    .setCustomId('last')
                    .setLabel('⏭️ Cuối')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === totalPages - 1)
            );

        const messageReply = await interaction.reply({ embeds: [generateEmbed(page)], components: [row()], fetchReply: true });

        const filter = (i) => ['first', 'prev', 'next', 'last'].includes(i.customId) && i.user.id === interaction.user.id;
        const collector = messageReply.createMessageComponentCollector({ filter, time: 300000 });

        collector.on('collect', (i) => {
            if (i.customId === 'first') {
                page = 0;
            } else if (i.customId === 'prev') {
                page--;
            } else if (i.customId === 'next') {
                page++;
            } else if (i.customId === 'last') {
                page = totalPages - 1;
            }

            i.update({ embeds: [generateEmbed(page)], components: [row()] });
        });

        collector.on('end', () => {
            messageReply.edit({ components: [] });
        });
    },
};