const { EmbedBuilder } = require('discord.js');
const { ownerId } = require('../../../config');

module.exports = {
    name: 'setavatar',
    description: '🖼️ Đặt ảnh đại diện của bot.',
    usage: '<attachment|url>',
    category: 'owner',
    permissions: [],
    ownerOnly: true,

    async execute(message, args) {
        if (message.author.id !== ownerId) {
            const noPermEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Truy cập bị từ chối')
                .setDescription('Bạn không có quyền sử dụng lệnh này.');

            return message.reply({ embeds: [noPermEmbed] });
        }

        const attachment = message.attachments.first();
        const url = args[0];

        let imageUrl = null;

        if (attachment) {
            imageUrl = attachment.url;
        } else if (url) {
            imageUrl = url;
        }

        if (imageUrl) {
            message.client.user.setAvatar(imageUrl)
                .then(() => {
                    const successEmbed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle('✅ Cập Nhật Thành Công')
                        .setDescription('Avatar của bot đã được cập nhật thành công! 🖼️')
                        .setImage(imageUrl);

                    message.reply({ embeds: [successEmbed] });
                })
                .catch(error => {
                    console.error(error);
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('🚫 Lỗi Cập Nhật')
                        .setDescription('Có lỗi khi cố gắng thay đổi avatar.');

                    message.reply({ embeds: [errorEmbed] });
                });
        } else {
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🚫 Thiếu Ảnh hoặc URL')
                .setDescription('Vui lòng đính kèm một hình ảnh hoặc cung cấp một URL để thay đổi avatar.');

            message.reply({ embeds: [errorEmbed] });
        }
    },
};