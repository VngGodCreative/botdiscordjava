const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, REST, Routes, ActivityType } = require('discord.js');
const { ready, botToken, presence } = require('./config');

console.log('\x1b[31m%s\x1b[0m', '------------------------------------------------------------------------------------------');
console.log('\x1b[31m%s\x1b[0m', '                                  BOT Discord');
console.log('\x1b[31m%s\x1b[0m', '                                Author: Creative');
console.log('\x1b[31m%s\x1b[0m', '------------------------------------------------------------------------------------------');
console.log(`${ready.colors.info}${ready.infoPrefix}\x1b[0m ${ready.emojis.commands} ${ready.colors.commands}Kiểm tra, cập nhật và lấy dữ liệu từ dự án ...\x1b[0m`);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();
client.slashCommands = new Collection();
client.logChannels = new Map();

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
function loadEvents(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.lstatSync(filePath);

        if (stat.isDirectory()) {
            loadEvents(filePath);
        } else if (file.endsWith('.js')) {
            const event = require(filePath);
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
            }
        }
    }
}

loadEvents(eventsPath);

// Load all data files from the data directory
const dataPath = path.join(__dirname, 'data');
function loadDataFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (file.endsWith('.json')) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            for (const guildId in data) {
                client.logChannels.set(guildId, data[guildId]);
            }
        }
    }
}

loadDataFiles(dataPath);

client.once('ready', async () => {
    const rest = new REST({ version: '10' }).setToken(botToken);
    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: client.slashCommands.map(cmd => cmd.data.toJSON()) }
        );

        // Thiết lập trạng thái và hoạt động của bot
        client.user.setPresence({
            status: presence.status,
            activities: presence.activities.map(activity => ({
                name: activity.name,
                type: ActivityType[activity.type]
            }))
        });

        console.log(`${ready.colors.info}${ready.infoPrefix}\x1b[0m ${ready.colors.ready}${ready.emojis.ready} Bot đã sẵn sàng vào hoạt động !!!\x1b[0m`);
    } catch (error) {
        console.error(error);
    }
});

client.login(botToken);

/** 
 * Anti Crash 
 */
function error(e) {
    console.error('Anti-crash handler:', e);
    // Bạn có thể thêm mã để ghi lỗi vào tệp hoặc gửi thông báo lỗi đến admin
}

process.on("unhandledRejection", (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    error(reason);
});

process.on("rejectionHandled", (promise) => {
    console.error('Rejection Handled:', promise);
    error(promise);
});

process.on("uncaughtException", (e) => {
    console.error('Uncaught Exception:', e);
    error(e);
});

process.on("uncaughtExceptionMonitor", (e) => {
    console.error('Uncaught Exception Monitor:', e);
    error(e);
});