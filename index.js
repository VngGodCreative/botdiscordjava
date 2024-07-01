const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const { ready, botToken } = require('./config');
console.log('\x1b[31m%s\x1b[0m', '------------------------------------------------------------------------------------------');
console.log('\x1b[31m%s\x1b[0m', '                                  BOT Discord');
console.log('\x1b[31m%s\x1b[0m', '                                Author: Creative');
console.log('\x1b[31m%s\x1b[0m', '------------------------------------------------------------------------------------------');
console.log(`${ready.colors.info}${ready.infoPrefix}\x1b[0m ${ready.emojis.commands} ${ready.colors.commands}Kiểm tra và lấy dữ liệu từ dự án ...\x1b[0m`);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.commands = new Collection();
client.slashCommands = new Collection();

function loadCommands(dir, collection) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.lstatSync(filePath);

        if (stat.isDirectory()) {
            loadCommands(filePath, collection);
        } else if (file.endsWith('.js')) {
            const command = require(path.resolve(filePath));
            collection.set(command.data ? command.data.name : command.name, command);
        }
    }
}

// Load prefix commands
loadCommands('./commands/prefix-commands', client.commands);

// Load slash commands
loadCommands('./commands/slash-commands', client.slashCommands);

// Load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.once('ready', async () => {
    const rest = new REST({ version: '10' }).setToken(botToken);
    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: client.slashCommands.map(cmd => cmd.data.toJSON()) }
        );
    } catch (error) {
        console.error(error);
    }
});

client.login(botToken);