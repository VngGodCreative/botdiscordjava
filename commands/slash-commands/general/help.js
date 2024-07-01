const { SlashCommandBuilder } = require('@discordjs/builders');
const { footer, categories } = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('📚 Hiển thị danh sách các lệnh slash'),
    category: 'general',

    async execute(interaction) {
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
                commands[cmd.category].push(`\`/${cmd.data.name}\``);
            }
        });

        const generalCommands = commands.general.join(', ') || 'Không có lệnh nào';
        const musicCommands = commands.music.join(', ') || 'Không có lệnh nào';
        const infoCommands = commands.info.join(', ') || 'Không có lệnh nào';
        const setupCommands = commands.setup.join(', ') || 'Không có lệnh nào';
        const adminCommands = commands.admin.join(', ') || 'Không có lệnh nào';
        const ownerCommands = commands.owner.join(', ') || 'Không có lệnh nào';

        await interaction.reply({
            embeds: [
                {
                    color: 0x0099ff,
                    title: '📜 Danh sách các lệnh sử dụng slash',
                    fields: [
                        { name: categories.general, value: generalCommands, inline: false },
                        { name: categories.music, value: musicCommands, inline: false },
                        { name: categories.info, value: infoCommands, inline: false },
                        { name: categories.setup, value: setupCommands, inline: false },
                        { name: categories.admin, value: adminCommands, inline: false },
                        { name: categories.owner, value: ownerCommands, inline: false }
                    ],
                    footer: {
                        text: `${footer.text} - ${footer.version}`,
                        icon_url: interaction.client.user.displayAvatarURL()
                    },
                },
            ],
            ephemeral: false
        });
    },
};