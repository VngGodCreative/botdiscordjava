# Bot Discord

## Mô tả

Bot Discord này được thiết kế để quản lý và tương tác với cộng đồng trên máy chủ của bạn. Bot hỗ trợ cả lệnh prefix và lệnh slash, giúp việc sử dụng dễ dàng và linh hoạt hơn.

## Chức năng

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

- **Lệnh Prefix**: Sử dụng bằng cách gõ `$<lệnh>` trong kênh chat.
- **Lệnh Slash**: Sử dụng bằng cách gõ `/` và chọn lệnh từ danh sách gợi ý.

## Ghi chú

- Đảm bảo rằng bot có quyền quản trị cần thiết trên máy chủ để thực thi các lệnh.
- Thay thế `YOUR_BOT_TOKEN` và các giá trị khác trong `config.js` bằng thông tin của bạn.

## Liên hệ

- **Tác giả**: Creative
- **Phiên bản**: v1.0

### Hướng dẫn:

1. **Tạo tệp `README.md`** trong thư mục gốc của dự án.
2. **Sao chép nội dung trên** vào tệp.
3. **Điền thông tin cần thiết** (như URL repository, token bot, v.v.).

Nếu cần thêm thông tin hoặc chỉnh sửa, hãy cho mình biết nhé!
