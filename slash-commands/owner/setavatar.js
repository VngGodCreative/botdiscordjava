const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { ownerId } = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setavatar')
        .setDescription('🖼️ Đặt ảnh đại diện của bot.')
        .addStringOption(option => 
            option.setName('url')
                .setDescription('🔗 URL của ảnh để đặt làm avatar')
                .setRequired(false))
        .addAttachmentOption(option =>
            option.setName('file')
                .setDescription('📄 Tệp ảnh để đặt làm avatar')
                .setRequired(false)),
    category: 'owner',
    async execute(interaction) {
        const url = interaction.options.getString('url');
        const file = interaction.options.getAttachment('file');

        if (interaction.user.id !== ownerId) {
            const noPermEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Truy cập bị từ chối')
                .setDescription('Bạn không có quyền sử dụng lệnh này.');

            return interaction.reply({ embeds: [noPermEmbed], ephemeral: false });
        }

        let imageUrl = null;

        if (file) {
            imageUrl = file.url;
        } else if (url) {
            imageUrl = url;
        }

        if (imageUrl) {
            interaction.client.user.setAvatar(imageUrl)
                .then(() => {
                    const successEmbed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle('✅ Cập Nhật Thành Công')
                        .setDescription('Avatar của bot đã được cập nhật thành công! 🖼️')
                        .setImage(imageUrl);

                    interaction.reply({ embeds: [successEmbed], ephemeral: false });
                })
                .catch(error => {
                    console.error(error);
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('🚫 Lỗi Cập Nhật')
                        .setDescription('Có lỗi khi cố gắng thay đổi avatar.');

                    interaction.reply({ embeds: [errorEmbed], ephemeral: false });
                });
        } else {
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🚫 Thiếu Ảnh hoặc URL')
                .setDescription('Vui lòng đính kèm một hình ảnh hoặc cung cấp một URL để thay đổi avatar.');

            interaction.reply({ embeds: [errorEmbed], ephemeral: false });
        }
    },
};