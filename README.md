# Creative BOT Java

Creative BOT Java là một bot Discord được xây dựng bằng Node.js, hỗ trợ phát nhạc từ nhiều nguồn như YouTube, SoundCloud, Spotify và Discord URL. Bot cũng cung cấp các tính năng hữu ích khác như gửi tin nhắn, quản lý server và nhiều hơn nữa, ngoài ra bot hỗ trợ chạy song song cả prefix và slash command nhằm tiện hơn.

## Cài đặt

1. **Clone repo từ GitHub:**

   ```sh
   git clone https://github.com/VngGodCreative/botdiscordjava.git
   ```

2. **Cài đặt các dependencies:**

   ```sh
   npm install
   ```

3. **Tạo file config:**

   Tạo một tệp `config.js` trong thư mục gốc của dự án với nội dung như sau:

   ```js
   module.exports = {
       botToken: 'YOUR_DISCORD_BOT_TOKEN',
       spotifyClientId: 'YOUR_SPOTIFY_CLIENT_ID',
       spotifyClientSecret: 'YOUR_SPOTIFY_CLIENT_SECRET',
       youtubeApiKey: 'YOUR_YOUTUBE_API_KEY',
       ownerId: 'YOUR_OWNER_ID',
       errorChannelId: 'YOUR_ERROR_CHANNEL_ID',
       prefix: '$',
       verify: {
           warningsconfig: true,
       },
       footer: {
           text: 'Code by Creative',
           version: 'v1.1',
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
       },
       presence: {
           // PresenceData object | https://discord.js.org/#/docs/main/stable/typedef/PresenceData
           status: "idle", //- You can have online, idle, dnd and invisible (Note: invisible makes people think the bot is offline)
           activities: [
               {
                   type: "WATCHING", //- PLAYING, WATCHING, LISTENING, STREAMING
                   name: "Ông zà đẻ ra con", //- Status Text
               },
           ],
       },
   };
   ```

### Lệnh /help
Hiển thị danh sách các lệnh và chi tiết về từng lệnh.

**Cách sử dụng:**
```sh
/help
```

## Cấu trúc Thư mục
```plaintext
.
CREATIVE BOT JAVA/
│
├── commands/
│   ├── prefix-commands/
│   │   ├── admin/
│   │   │   ├── ban.js
│   │   │   ├── kick.js
│   │   │   ├── mute.js
│   │   │   └── unban.js
│   │   │
│   │   ├── general/
│   │   │   ├── about.js
│   │   │   ├── afk.js
│   │   │   ├── help.js
│   │   │   ├── ping.js
│   │   │   └── report_error.js
│   │   │
│   │   ├── info/
│   │   │   ├── avatar.js
│   │   │   ├── emoji_list.js
│   │   │   ├── server_list.js
│   │   │   ├── server.js
│   │   │   └── user.js
│   │   │
│   │   ├── music/
│   │   │   ├── join.js
│   │   │   └── leave.js
│   │   │
│   │   ├── owner/
│   │   │   ├── setavatar.js
│   │   │   └── update.js
│   │   │
│   │   └── setup/
│   │       ├── stealemoji.js
│   │       ├── setupemoji.js
│   │       └── setupticket.js
│   │
│   └── slash-commands/
│       ├── admin/
│       │   ├── ban.js
│       │   ├── kick.js
│       │   ├── mute.js
│       │   ├── say.js
│       │   ├── steal.js
│       │   └── unban.js
│       │
│       ├── general/
│       │   ├── about.js
│       │   ├── afk.js
│       │   ├── help.js
│       │   ├── ping.js
│       │   └── report_error.js
│       │
│       ├── info/
│       │   ├── avatar.js
│       │   ├── emoji_list.js
│       │   ├── server_list.js
│       │   ├── server.js
│       │   └── user.js
│       │
│       ├── music/
│       │   ├── 24-7.js
│       │   ├── add.js
│       │   ├── join.js
│       │   ├── leave.js
│       │   ├── pause.js
│       │   ├── play.js
│       │   ├── queue.js
│       │   ├── resume.js
│       │   ├── search.js
│       │   └── stop.js
│       │
│       ├── owner/
│       │   ├── setavatar.js
│       │   └── update.js
│       │
│       └── setup/
│           ├── setupemoji.js
│           └── setupticket.js
│
├── data/
│   ├── afk.json
│   └── invite_link.json
│
├── events/
│   ├── interactionCreate.js
│   ├── messageCreate.js
│   ├── ready.js
│   └── ticketCreate.js
│
├── node_modules/
│
├── config.js
├── index.js
├── package-lock.json
├── package.json
├── readme.md
└── Start.bat
```

## Liên hệ

Nếu bạn có bất kỳ câu hỏi hoặc góp ý nào, vui lòng liên hệ qua email: `vnggodcreative@gmail.com`

Hoặc [Tham gia nhóm](https://discord.gg/4Sbc2hVvNT)

## Giấy phép

Creative BOT Java được cấp phép theo MIT License.
