const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { footer } = require('../../../config');

module.exports = {
    name: 'emojilist',
    description: '📋 Hiển thị danh sách các emoji trong server',
    category: 'info',
    async execute(message) {
        const guild = message.guild;
        const emojis = Array.from(guild.emojis.cache.values());

        const maxPerPage = 10;
        let page = 0;
        const totalPages = Math.ceil(emojis.length / maxPerPage);
        let timeout = null;

        const generateEmbed = (page) => {
            const start = page * maxPerPage;
            const end = start + maxPerPage;

            const description = emojis.slice(start, end).map((emoji, index) => (
                `**${start + index + 1}.** ${emoji}\n**Tên Emoji:** \`${emoji.name}\`\n**ID Emoji:** \`${emoji.id}\`\n`
            )).join('\n');

            return new EmbedBuilder()
                .setColor(0x00AE86)
                .setTitle(`📋 Danh sách emoji Server ${guild.name}`)
                .setDescription(description)
                .setFooter({
                    text: `${footer.text} ${footer.version} | ${new Date().toLocaleTimeString('vi-VN')} - ${new Date().toLocaleDateString('vi-VN')}`,
                    iconURL: footer.icon_url || message.client.user.displayAvatarURL()
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

        const messageReply = await message.reply({ embeds: [generateEmbed(page)], components: [row()] });

        const filter = (interaction) => {
            return ['first', 'prev', 'next', 'last'].includes(interaction.customId) && interaction.user.id === message.author.id;
        };

        const collector = messageReply.createMessageComponentCollector({ filter, time: 300000 });

        const resetTimer = () => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => {
                messageReply.edit({ components: [] });
            }, 300000); // 300000ms = 5 minutes
        };

        resetTimer();

        collector.on('collect', (interaction) => {
            if (interaction.customId === 'first') {
                page = 0;
            } else if (interaction.customId === 'prev') {
                page--;
            } else if (interaction.customId === 'next') {
                page++;
            } else if (interaction.customId === 'last') {
                page = totalPages - 1;
            }

            interaction.update({
                embeds: [generateEmbed(page)],
                components: [row()]
            });

            resetTimer();
        });

        collector.on('end', () => {
            messageReply.edit({ components: [] });
        });
    },
};