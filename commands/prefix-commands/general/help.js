const { prefix, footer, categories } = require('../../../config');

module.exports = {
    name: 'help',
    description: '📚 Hiển thị danh sách các lệnh prefix',
    category: 'general',
    aliases: ['h'],
    execute(message, args) {
        const commands = {
            admin: [],
            owner: [],
            general: [],
            music: [],
            setup: [],
            info: []
        };

        if (args.length) {
            const cmdName = args[0].toLowerCase();
            const command = message.client.commands.get(cmdName) || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(cmdName));

            if (!command) {
                return message.reply('Không tìm thấy lệnh.');
            }

            const aliases = command.aliases ? command.aliases.join(', ') : 'Không có';
            const usage = command.usage ? `${prefix}${command.name} ${command.usage}` : `${prefix}${command.name}`;
            const categoryName = categories[command.category] || 'Không xác định';

            return message.channel.send({
                embeds: [
                    {
                        color: 0x0099ff,
                        title: `Thông tin lệnh: ${command.name}`,
                        fields: [
                            { name: 'Danh mục', value: `${categoryName}` },
                            { name: 'Mô tả', value: command.description || 'Không có mô tả' },
                            { name: 'Cách dùng', value: usage },
                            { name: 'Các câu gọi khác', value: aliases }
                        ],
                        footer: {
                            text: `${footer.text} ${footer.version}`,
                            icon_url: message.client.user.displayAvatarURL()
                        },
                    }
                ],
            });
        }

        message.client.commands.forEach(cmd => {
            if (cmd.category) {
                commands[cmd.category].push(`\`${prefix}${cmd.name}\``);
            }
        });

        const generalCommands = commands.general.join(', ') || 'Không có lệnh nào';
        const musicCommands = commands.music.join(', ') || 'Không có lệnh nào';
        const infoCommands = commands.info.join(', ') || 'Không có lệnh nào';
        const setupCommands = commands.setup.join(', ') || 'Không có lệnh nào';
        const adminCommands = commands.admin.join(', ') || 'Không có lệnh nào';
        const ownerCommands = commands.owner.join(', ') || 'Không có lệnh nào';

        return message.channel.send({
            embeds: [
                {
                    color: 0x0099ff,
                    title: '📜 Danh sách các lệnh sử dụng prefix',
                    fields: [
                        { name: categories.general, value: generalCommands, inline: false },
                        { name: categories.music, value: musicCommands, inline: false },
                        { name: categories.info, value: infoCommands, inline: false },
                        { name: categories.setup, value: setupCommands, inline: false },
                        { name: categories.admin, value: adminCommands, inline: false },
                        { name: categories.owner, value: ownerCommands, inline: false }
                    ],
                    footer: {
                        text: `${footer.text} ${footer.version}`,
                        icon_url: message.client.user.displayAvatarURL()
                    },
                },
            ],
        });
    },
};