const { footer, version } = require('../../../config');

module.exports = {
    name: 'ping',
    description: '🏓 Kiểm tra độ trễ của bot',
    category: 'general',
    execute(message) {
        const latency = Date.now() - message.createdTimestamp;
        const apiLatency = Math.round(message.client.ws.ping);

        message.channel.send({
            embeds: [
                {
                    color: 0x0099ff,
                    title: '🏓 Pong!',
                    description: `Độ trễ: ${latency}ms\nĐộ trễ API: ${apiLatency}ms\n\nTốc độ bot phản hồi tới máy chủ là **${(latency / 1000).toFixed(2)} giây**.`,
                    footer: {
                        text: `${footer.text} - ${version}`,
                        icon_url: message.client.user.displayAvatarURL(),
                    },
                },
            ],
        });
    },
};