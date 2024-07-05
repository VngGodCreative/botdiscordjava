const os = require('os');
const { ready, token, ownerId, errorChannelId, warningsconfig } = require('../config');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        const totalSlashCommands = client.slashCommands.size;
        const totalPrefixCommands = client.commands.size;
        const totalEvents = client.eventNames().length;
        const osType = os.type();
        const osArch = os.arch();
        const cpuUsage = process.cpuUsage();
        const totalCpuTime = cpuUsage.user + cpuUsage.system;
        const cpuPercent = ((totalCpuTime / (os.uptime() * 1000000)) * 100).toFixed(2);
        const memoryUsage = process.memoryUsage().rss;
        const totalMemory = os.totalmem();
        const memoryPercent = ((memoryUsage / totalMemory) * 100).toFixed(2);
        const cpuCores = os.cpus().length;
        const totalMemoryGB = (totalMemory / (1024 ** 3)).toFixed(2);
        const cpuDisplay = `${cpuPercent}%/100% (${cpuCores} cores)`;
        const memoryDisplay = `${memoryPercent}%/100% (${totalMemoryGB} GB)`;

        console.log(`${ready.colors.info}${ready.infoPrefix}\x1b[0m ${ready.emojis.start} ${ready.colors.start}BOT: ${client.user.tag} | ID: ${client.user.id}\x1b[0m`);
        console.log(`${ready.colors.info}${ready.infoPrefix}\x1b[0m ${ready.emojis.commands} ${ready.colors.commands}Tổng số câu lệnh Slash: ${totalSlashCommands}\x1b[0m`);
        console.log(`${ready.colors.info}${ready.infoPrefix}\x1b[0m ${ready.emojis.prefixCommands} ${ready.colors.prefixCommands}Tổng số câu lệnh Prefix: ${totalPrefixCommands}\x1b[0m`);
        console.log(`${ready.colors.info}${ready.infoPrefix}\x1b[0m ${ready.emojis.events} ${ready.colors.events}Tổng số sự kiện: ${totalEvents}\x1b[0m`);
        console.log(`${ready.colors.info}${ready.infoPrefix}\x1b[0m ${ready.emojis.os} ${ready.colors.os}Hệ điều hành: ${osType} (${osArch})\x1b[0m`);
        console.log(`${ready.colors.info}${ready.infoPrefix}\x1b[0m ${ready.emojis.cpu} ${ready.colors.cpu}Sử dụng CPU (bot): ${cpuDisplay}\x1b[0m`);
        console.log(`${ready.colors.info}${ready.infoPrefix}\x1b[0m ${ready.emojis.ram} ${ready.colors.ram}Sử dụng RAM (bot): ${memoryDisplay}\x1b[0m`);

        checkConfig(); // Call the function here

        // Bắt đầu tìm chủ bot
        const findOwnerEvent = require('./find_owner');
        findOwnerEvent.execute(client);
    },
};

function checkConfig() {
    if (!warningsconfig) return;

    const missingFields = [];

    if (!token.bot) missingFields.push('token.bot');
    if (!ownerId) missingFields.push('ownerId');
    if (!errorChannelId) missingFields.push('errorChannelId');

    if (missingFields.length > 0) {
        console.warn(`${ready.colors.warnings}${ready.warningsprefix}\x1b[0m ${ready.emojis.warnings} ${ready.colors.warnings}Cảnh báo: Các trường sau chưa được điền trong config: ${missingFields.join(', ')}\x1b[0m`);
    } else {
        console.log(`${ready.colors.info}${ready.infoPrefix}\x1b[0m ${ready.emojis.ready} ${ready.colors.ready}Tất cả các trường config đã được điền đầy đủ\x1b[0m`);
    }
}