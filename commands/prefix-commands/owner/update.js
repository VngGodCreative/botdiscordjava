const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { ownerId } = require('../../../config');

module.exports = {
    name: 'update',
    description: 'Tải lại các lệnh và sự kiện của bot',
    category: 'owner',

    async execute(message) {
        if (message.author.id !== ownerId) {
            const noPermEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Truy cập bị từ chối')
                .setDescription('Bạn không có quyền sử dụng lệnh này.');

            return message.reply({ embeds: [noPermEmbed] });
        }

        const reloadEmbed = new EmbedBuilder()
            .setColor('#FFFF00')
            .setTitle('🔄 Đang cập nhật, đồng bộ các sự kiện, prefix và slash')
        await message.reply({ embeds: [reloadEmbed] });

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

        const successEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ Đã cập nhật thành công')
        message.channel.send({ embeds: [successEmbed] });
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