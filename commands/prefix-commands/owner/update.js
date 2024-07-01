const fs = require('fs');
const path = require('path');
const { ownerId } = require('../../../config');

module.exports = {
    name: 'update',
    description: 'Tải lại các lệnh và sự kiện của bot',
    category: 'owner',

    async execute(message) {
        if (message.author.id !== ownerId) {
            return message.reply('❌ Bạn không có quyền sử dụng lệnh này.');
        }

        await message.reply('🔄 Đang tải lại các lệnh và sự kiện...');

        const { client } = message;

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

        message.channel.send('✅ Đã tải lại các lệnh và sự kiện thành công!');
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