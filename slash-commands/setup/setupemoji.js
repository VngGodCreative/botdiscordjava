const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { footer } = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup_emoji')
        .setDescription('🖼️ Thêm emoji vào server.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Tên của emoji')
                .setRequired(true))
        .addAttachmentOption(option =>
            option.setName('file')
                .setDescription('Tệp ảnh của emoji')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    category: 'setup',
    async execute(interaction) {
        const name = interaction.options.getString('name');
        const file = interaction.options.getAttachment('file');

        // Kiểm tra quyền quản trị viên của người dùng
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            const noPermEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Truy cập bị từ chối')
                .setDescription('Bạn không có quyền sử dụng lệnh này.')
                .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url || interaction.client.user.displayAvatarURL() });

            return interaction.reply({ embeds: [noPermEmbed], ephemeral: true });
        }

        // Kiểm tra nếu lệnh được sử dụng trong server
        if (!interaction.guild) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🚫 Lỗi')
                .setDescription('Lệnh này chỉ có thể được sử dụng trong server.')
                .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url || interaction.client.user.displayAvatarURL() });

            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        // Thêm emoji vào server
        interaction.guild.emojis.create({ attachment: file.url, name: name })
            .then(emoji => {
                const successEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('✅ Thêm Emoji Thành Công')
                    .setDescription(`Emoji ${emoji} đã được thêm vào server với tên \`${name}\`!`)
                    .setImage(file.url)
                    .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url || interaction.client.user.displayAvatarURL() });

                interaction.reply({ embeds: [successEmbed], ephemeral: false });
            })
            .catch(error => {
                console.error(error);
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('🚫 Lỗi Thêm Emoji')
                    .setDescription('Có lỗi khi thêm emoji vào server. ❌')
                    .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url || interaction.client.user.displayAvatarURL() });

                interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            });
    },
};