const { SlashCommandBuilder } = require('@discordjs/builders');
const { footer } = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('🏓 Kiểm tra độ trễ của bot'),
    category: 'general',

    async execute(interaction) {
        const latency = Date.now() - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);

        await interaction.reply({
            embeds: [
                {
                    color: 0x0099ff,
                    title: '🏓 Pong!',
                    description: `Độ trễ: ${latency}ms\nĐộ trễ API: ${apiLatency}ms\n\nTốc độ bot phản hồi tới máy chủ là **${(latency / 1000).toFixed(2)} giây**.`,
                    footer: {
                        text: `${footer.text} - ${footer.version}`,
                        icon_url: footer.icon_url || interaction.client.user.displayAvatarURL()
                    },
                },
            ],
            ephemeral: false
        });
    },
};