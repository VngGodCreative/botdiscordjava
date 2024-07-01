const os = require('os');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { footer } = require('../../../config');
const si = require('systeminformation');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('ℹ️ Thông tin về bot'),
    category: 'general',

    async execute(interaction) {
        await interaction.deferReply();

        const cpuUsage = process.cpuUsage();
        const totalCpuTime = cpuUsage.user + cpuUsage.system;
        const cpuPercent = ((totalCpuTime / 1000000) / os.cpus().length).toFixed(2);
        const memoryUsage = process.memoryUsage().rss;
        const totalMemory = os.totalmem();
        const memoryPercent = ((memoryUsage / totalMemory) * 100).toFixed(2);

        // Lấy thông tin hệ thống
        const cpuData = await si.cpu();
        const gpuData = await si.graphics();
        const mainboardData = await si.baseboard();
        const ramData = await si.memLayout();

        // Chi tiết CPU
        const cpuModel = cpuData.brand;
        const cpuCores = cpuData.cores;
        const cpuThreads = cpuData.threads;

        // Chi tiết GPU
        const gpuModel = gpuData.controllers[0]?.model || 'Không xác định';
        const gpuMemory = `${gpuData.controllers[0]?.vram} MB` || 'Không xác định';
        const gpuType = gpuData.controllers[0]?.bus || 'Không xác định';
        const gpuUsage = gpuData.controllers[0]?.utilizationGpu || 'Không xác định';

        // Chi tiết RAM
        const ramName = `${ramData[0]?.manufacturer} ${ramData[0]?.type}` || 'Không xác định';
        const ramSize = `${(ramData[0]?.size / (1024 ** 3)).toFixed(2)} GB`;
        const ramBus = `${ramData[0]?.clockSpeed} MHz`;

        // Chi tiết Mainboard
        const mainboardModel = `${mainboardData.manufacturer} ${mainboardData.model}`;

        // Thông tin ngày tạo bot và thời gian khởi động
        const botCreationDate = `<t:${Math.floor(interaction.client.user.createdTimestamp / 1000)}:R>`;
        const botUptime = `<t:${Math.floor((Date.now() - process.uptime() * 1000) / 1000)}:R>`;
        const totalServers = interaction.client.guilds.cache.size;
        const totalPrefixCommands = interaction.client.commands.size;
        const totalSlashCommands = interaction.client.slashCommands.size;

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('ℹ️ Thông tin về bot')
            .addFields(
                { name: '🤖 Tên Bot', value: `${interaction.client.user.username}`, inline: true },
                { name: '🏷️ Tag Bot', value: `<@${interaction.client.user.id}>`, inline: true },
                { name: '🆔 ID Bot', value: `${interaction.client.user.id}`, inline: true },
                { name: '📅 Ngày Tạo Bot', value: `${botCreationDate}`, inline: true },
                { name: '⏱️ Thời Gian Khởi Động', value: `${botUptime}`, inline: true },
                { name: '📦 Phiên bản Bot', value: `${footer.version}`, inline: true },
                { name: '🌐 Tổng Số Server', value: `${totalServers}`, inline: true },
                { name: '🔤 Tổng Lệnh Prefix', value: `${totalPrefixCommands}`, inline: true },
                { name: '📜 Tổng Lệnh Slash', value: `${totalSlashCommands}`, inline: true },
                { name: '🖥️ Sử dụng CPU', value: `${cpuPercent}%`, inline: true },
                { name: '🎮 Sử dụng GPU', value: `${gpuUsage}%`, inline: true },
                { name: '💾 Sử dụng RAM', value: `${memoryPercent}%`, inline: true },
                { name: '🧠 Chip CPU', value: `${cpuModel} (${cpuCores} cores, ${cpuThreads} threads)`, inline: false },
                { name: '🎮 GPU', value: `${gpuModel} (${gpuType}, ${gpuMemory})`, inline: false },
                { name: '💾 RAM', value: `${ramName} (${ramSize}, ${ramBus})`, inline: false },
                { name: '🔧 Mainboard', value: `${mainboardModel}`, inline: false }
            )
            .setFooter({
                text: `${footer.text} | ${footer.version}`,
                iconURL: interaction.client.user.displayAvatarURL()
            });

        await interaction.editReply({ embeds: [embed] });
    },
};