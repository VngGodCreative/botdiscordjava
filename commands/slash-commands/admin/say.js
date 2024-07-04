const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { footer } = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('📢 🗣️ Làm cho bot nói một điều gì đó')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Định dạng tin nhắn')
                .setRequired(true)
                .addChoices(
                    { name: 'plaintext', value: 'plaintext' },
                    { name: 'embed', value: 'embed' }
                ))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('📩 Nội dung tin nhắn bạn muốn bot nói')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('image')
                .setDescription('🖼️ URL hình ảnh')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('color')
                .setDescription('🎨 Màu tin nhắn embed (dạng HEX)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('title')
                .setDescription('📝 Tiêu đề embed')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('footer')
                .setDescription('🔻 Chân embed')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    category: 'admin',
    usage: '/say <type> <message> [image] [color] [title] [footer]',

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: '❌ Bạn không có quyền sử dụng lệnh này.', ephemeral: true });
        }

        const type = interaction.options.getString('type');
        const messageContent = interaction.options.getString('message');
        const image = interaction.options.getString('image');
        const color = interaction.options.getString('color') || '#0099ff';
        const title = interaction.options.getString('title');
        const customFooter = interaction.options.getString('footer');

        if (type === 'plaintext') {
            if (image) {
                await interaction.channel.send({ content: messageContent, files: [image] });
            } else {
                await interaction.channel.send(messageContent);
            }
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#00ff00')
                        .setTitle('✅ Thành công')
                        .setDescription('Tin nhắn đã được gửi dưới dạng plaintext!')
                        .setFooter({
                            text: `${footer.text} ${footer.version}`,
                            iconURL: footer.icon_url || interaction.client.user.displayAvatarURL()
                        })
                ],
                ephemeral: true
            });
        } else if (type === 'embed') {
            const embed = new EmbedBuilder()
                .setColor(color)
                .setTitle(title || '📢 Tin nhắn từ bot')
                .setDescription(messageContent)
                .setFooter({
                    text: customFooter || `${footer.text} ${footer.version}`,
                    iconURL: footer.icon_url || interaction.client.user.displayAvatarURL()
                });

            if (image) embed.setImage(image);

            await interaction.channel.send({ embeds: [embed] });
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#00ff00')
                        .setTitle('✅ Thành công')
                        .setDescription('Tin nhắn đã được gửi dưới dạng embed!')
                        .setFooter({
                            text: `${footer.text} ${footer.version}`,
                            iconURL: footer.icon_url || interaction.client.user.displayAvatarURL()
                        })
                ],
                ephemeral: true
            });
        }
    },
};