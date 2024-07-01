const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');
const { ownerId } = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('🔄 Tải lại các lệnh và sự kiện của bot'),
    category: 'owner',

    async execute(interaction) {
        if (interaction.user.id !== ownerId) {
            return interaction.reply({ content: '❌ Bạn không có quyền sử dụng lệnh này.', ephemeral: true });
        }

        await interaction.reply('🔄 Đang tải lại các lệnh và sự kiện...');

        const { client } = interaction;

        // Xóa tất cả lệnh và sự kiện
        client.commands.clear();
        client.slashCommands.clear();
        client.removeAllListeners();

        // Tải lại lệnh prefix
        loadCommands(path.join(__dirname, '../../prefix-commands'), client.commands);

        // Tải lại lệnh slash
        loadCommands(path.join(__dirname, '../../slash-commands'), client.slashCommands);

        // Tải lại sự kiện
        loadEvents(client);

        await interaction.followUp({ content: '✅ Đã tải lại các lệnh và sự kiện thành công!', ephemeral: false });
    },
};

function loadCommands(dir, collection) {
    const commandFiles = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of commandFiles) {
        if (file.isDirectory()) {
            loadCommands(path.join(dir, file.name), collection);
        } else if (file.name.endsWith('.js')) {
            const filePath = path.join(dir, file.name);
            delete require.cache[require.resolve(filePath)];
            const command = require(filePath);
            collection.set(command.data ? command.data.name : command.name, command);
        }
    }
}

function loadEvents(client) {
    const eventsPath = path.join(__dirname, '../../../events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        delete require.cache[require.resolve(filePath)];
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
}