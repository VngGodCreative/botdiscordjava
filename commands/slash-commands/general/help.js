const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const { footer, categories } = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('📚 Hiển thị danh sách các lệnh slash')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('📩 Tên lệnh bạn muốn xem chi tiết')
                .setRequired(false)),
    category: 'general',

    async execute(interaction) {
        const commandName = interaction.options.getString('command');

        if (commandName) {
            const command = interaction.client.slashCommands.get(commandName);
            if (!command) {
                return interaction.reply({ content: `❌ Lệnh \`${commandName}\` không tồn tại.`, ephemeral: true });
            }

            const commandDetailEmbed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle(`Chi tiết lệnh: \`/${command.data.name}\``)
                .setDescription(command.data.description || 'Không có mô tả')
                .addFields(
                    { name: 'Tên lệnh', value: `\`/${command.data.name}\``, inline: true },
                    { name: 'Mô tả', value: command.data.description || 'Không có mô tả', inline: true },
                    { name: 'Danh mục', value: command.category || 'Không có danh mục', inline: true },
                    { name: 'Cách sử dụng', value: command.usage || 'Không có cách sử dụng', inline: true }
                )
                .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: interaction.client.user.displayAvatarURL() });

            return interaction.reply({ embeds: [commandDetailEmbed], ephemeral: true });
        }

        const commands = {
            admin: [],
            owner: [],
            general: [],
            music: [],
            setup: [],
            info: []
        };

        interaction.client.slashCommands.forEach(cmd => {
            if (cmd.category) {
                commands[cmd.category].push({
                    label: `/${cmd.data.name}`,
                    description: cmd.data.description || 'Không có mô tả',
                    value: cmd.data.name
                });
            }
        });

        const generalCommands = commands.general.map(cmd => `\`${cmd.label}\``).join(', ') || 'Không có lệnh nào';
        const musicCommands = commands.music.map(cmd => `\`${cmd.label}\``).join(', ') || 'Không có lệnh nào';
        const infoCommands = commands.info.map(cmd => `\`${cmd.label}\``).join(', ') || 'Không có lệnh nào';
        const setupCommands = commands.setup.map(cmd => `\`${cmd.label}\``).join(', ') || 'Không có lệnh nào';
        const adminCommands = commands.admin.map(cmd => `\`${cmd.label}\``).join(', ') || 'Không có lệnh nào';
        const ownerCommands = commands.owner.map(cmd => `\`${cmd.label}\``).join(', ') || 'Không có lệnh nào';

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('📜 Danh sách các lệnh sử dụng slash')
            .addFields(
                { name: categories.general, value: generalCommands, inline: false },
                { name: categories.music, value: musicCommands, inline: false },
                { name: categories.info, value: infoCommands, inline: false },
                { name: categories.setup, value: setupCommands, inline: false },
                { name: categories.admin, value: adminCommands, inline: false },
                { name: categories.owner, value: ownerCommands, inline: false }
            )
            .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: interaction.client.user.displayAvatarURL() });

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('select-category')
                    .setPlaceholder('Chọn một danh mục để xem chi tiết')
                    .addOptions([
                        { label: categories.general, value: 'general' },
                        { label: categories.music, value: 'music' },
                        { label: categories.info, value: 'info' },
                        { label: categories.setup, value: 'setup' },
                        { label: categories.admin, value: 'admin' },
                        { label: categories.owner, value: 'owner' }
                    ])
            );

        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: false
        });

        const filter = i => i.customId === 'select-category' && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: ComponentType.StringSelect, time: 60000 });

        collector.on('collect', async i => {
            const category = i.values[0];
            const selectedCommands = commands[category];

            const commandEmbed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle(`📜 Các lệnh trong danh mục: ${categories[category]}`)
                .setDescription(selectedCommands.map(cmd => `\`${cmd.label}\`: ${cmd.description}`).join('\n'))
                .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: interaction.client.user.displayAvatarURL() });

            await i.update({ embeds: [commandEmbed], components: [], ephemeral: true });
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply({ components: [] });
            }
        });
    },
};