# Javabot Discord - Code by Creative

## BOT NÀY ĐƯỢC PHÁT TRIỂN DỰA THEO LOGIC CỦA CREATIVE VÀ CẢI THIỆN UPDATE BỞI GPT, VUI LÒNG KHÔNG ĐIỀU CHỈNH BẤT CỨ THỨ GÌ TRONG TỆP config.js ngoài token và id để tránh bị lỗi

Bot Discord này được thiết kế để quản lý và tương tác với cộng đồng trên máy chủ của bạn. Bot hỗ trợ cả lệnh prefix và lệnh slash, giúp việc sử dụng dễ dàng và linh hoạt hơn.

## Liên hệ
- **Nếu phát sinh lỗi gì vui lòng liên hệ hoặc tham gia nhóm để báo cáo lỗi**: [Creative](https://discord.gg/4Sbc2hVvNT)
- **Phiên bản bot hiện tại đang chạy nền tảng NodeJS**: v1.0

### Lệnh Prefix

- **$ping**: Kiểm tra độ trễ của bot.
- **$ban**: 🚫 Cấm một người dùng khỏi máy chủ.
- **$kick**: 👢 Đuổi một người dùng khỏi máy chủ.
- **$help**: Hiển thị danh sách các lệnh.
- **$join**: 🔊 Tham gia kênh thoại.
- **$leave**: 🔇 Rời khỏi kênh thoại.
- **$mute**: 🤐 Mute một thành viên với thời gian tùy chỉnh.
- **$afk**: 🚶‍♂️ Đặt trạng thái AFK.
- **$update**: 🔄 Cập nhật lại các lệnh và sự kiện.
- **$report_error**: 🐞 Báo cáo lỗi tới kênh quản trị.
- Và nhiều lệnh nữa đang update dần dần ...

### Lệnh Slash

- **/ping**: Kiểm tra độ trễ của bot.
- **/ban**: 🚫 Cấm một người dùng khỏi máy chủ.
- **/kick**: 👢 Đuổi một người dùng khỏi máy chủ.
- **/help**: 📚 Hiển thị danh sách các lệnh.
- **/join**: 🔊 Tham gia kênh thoại.
- **/leave**: 🔇 Rời khỏi kênh thoại.
- **/mute**: 🤐 Mute một thành viên với thời gian tùy chỉnh.
- **/afk**: 🚶‍♂️ Đặt trạng thái AFK.
- **/about**: ℹ️ Hiển thị thông tin về bot.
- **/update**: 🔄 Cập nhật lại các lệnh và sự kiện.
- **/report_error**: 🐞 Báo cáo lỗi tới kênh quản trị.
- Và nhiều lệnh nữa đang update dần dần ...

## Cài đặt

1. Clone repository này:
   ```bash
   git clone https://github.com/VngGodCreative/botdiscordjava.git
   ```

2. Cài đặt các gói cần thiết:
   ```bash
   npm install
   ```

3. Cấu hình bot trong tệp `config.js`:
   ```javascript
      module.exports = {
       botToken: 'YOUR_BOT_TOKEN',
       spotifyClientId: 'YOUR_SPOTIFY_CLIENT_ID',
       spotifyClientSecret: 'YOUR_SPOTIFY_CLIENT_SECRET',
       ownerId: 'YOUR_OWNER_ID',
       prefix: '$',
       version: 'v1.0',
       footer: {
           text: 'Code by Creative',
           icon_url: null // Để tự động lấy avatar của bot
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
   ```
   
4. Khởi chạy bot:
   ```bash
   node index.js
   ```

## Cấu trúc thư mục

```project
.
├── commands
│   ├── prefix-commands
│   │   ├── admin
│   │   │   ├── ban.js
│   │   │   ├── kick.js
│   │   │   ├── mute.js
│   │   ├── music
│   │   │   ├── join.js
│   │   │   ├── leave.js
│   │   ├── owner
│   │   │   ├── update.js
│   │   ├── about.js
│   │   ├── afk.js
│   │   ├── help.js
│   │   ├── ping.js
│   │   └── report_error.js
│   └── slash-commands
│       ├── admin
│       │   ├── ban.js
│       │   ├── kick.js
│       │   ├── mute.js
│       ├── music
│       │   ├── join.js
│       │   ├── leave.js
│       ├── owner
│       │   ├── update.js
│       ├── about.js
│       ├── afk.js
│       ├── help.js
│       ├── ping.js
│       └── report_error.js
├── data
│   ├── afk.json
│   └── invite_link.json
├── events
│   ├── interactionCreate.js
│   ├── messageCreate.js
│   └── ready.js
├── node_modules
├── config.js
├── index.js
├── package-lock.json
├── package.json
├── readme.md
└── start.bat
```

## Hướng dẫn sử dụng
- **Điền thông tin cần thiết** (như URL repository, token bot, v.v.).
- **Lệnh Prefix**: Sử dụng bằng cách gõ `$<lệnh>` trong kênh chat.
- **Lệnh Slash**: Sử dụng bằng cách gõ `/` và chọn lệnh từ danh sách gợi ý.

## Ghi chú
- Đảm bảo rằng bot có quyền quản trị hoặc quyền cao nhất trên máy chủ để thực thi các lệnh.
- Thay thế `YOUR_BOT_TOKEN` và các giá trị khác trong `config.js` bằng thông tin của bạn.
