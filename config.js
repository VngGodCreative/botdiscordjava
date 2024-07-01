module.exports = {
    botToken: 'MTI1NjQ5NDQ5NjI1OTI0ODE4OA.G9u6a_.i5hBwueIyIxBXbKgu7S_M6GqNmeYiBzseT7oAw',
    spotifyClientId: '162a5e39056545179d8339fbe03dfe53',
    spotifyClientSecret: '38696722229a4f7cacf7473474ece1c9',
    ownerId: '711115131064549498',
    errorChannelId: '1250091457482723359',
    prefix: '$',
    verify: {
        warningsconfig: true,
    },
    footer: {
        text: 'Code by Creative',
        version: 'v1.0',
        icon_url: null //đặt 'link avatar' cho phản hồi hoặc null để sử dụng avatar mặc định của bot
    },
    categories: {
        admin: '🔧 Lệnh Admin',
        owner: '👑 Lệnh Owner',
        general: '👥 Lệnh cho mọi người',
        music: '🎵 Lệnh Nhạc',
        setup: '⚙️ Lệnh Setup',
        info: 'ℹ️ Lệnh kiểm tra thông tin'
    },
    ready: {
        colors: {
            info: '\x1b[36m',  // Cyan for [INFO]
            warnings: '\x1b[33m',  // Yellow for [WARNING]
            ready: '\x1b[32m',  // Green for [READY]
            user: '\x1b[34m',
            start: '\x1b[32m',
            commands: '\x1b[33m',  // Green
            prefixCommands: '\x1b[33m',  // Yellow
            events: '\x1b[33m',  // Blue
            os: '\x1b[35m',  // Magenta
            cpu: '\x1b[35m',  // Cyan
            ram: '\x1b[35m'  // Red
        },
        emojis: {
            start: '🚀',
            commands: '📜',
            prefixCommands: '🔤',
            events: '🔔',
            os: '💻',
            cpu: '🖥️',
            ram: '💾',
            warnings: '⚠️',
            ready: '✅'
        },
        infoPrefix: '[INFO]',
        warningsprefix: '[WARN]',
        userprefix: '[USER]'
    }
  };