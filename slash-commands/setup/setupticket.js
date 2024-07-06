const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { footer } = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup_ticket')
        .setDescription('🎟️ Thiết lập hệ thống ticket')
        .addStringOption(option =>
            option.setName('message_type')
                .setDescription('📩 Chọn loại tin nhắn')
                .setRequired(true)
                .addChoices(
                    { name: 'Embed', value: 'embed' },
                    { name: 'Plaintext', value: 'plaintext' }
                ))
        .addStringOption(option =>
            option.setName('content')
                .setDescription('📝 Nội dung của tin nhắn')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('channel_title')
                .setDescription('📌 Tiêu đề kênh mà bạn muốn đặt')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('category_name')
                .setDescription('📁 Tên danh mục mà bạn muốn đặt')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('channel_name')
                .setDescription('📃 Tên kênh mà bạn muốn đặt')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('title')
                .setDescription('📌 Tiêu đề của tin nhắn embed (nếu chọn embed)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('image_url')
                .setDescription('🌐 Link ảnh cho tin nhắn embed (nếu có)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('plaintext')
                .setDescription('📝 Nội dung văn bản thuần (nếu có)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    category: 'setup',

    async execute(interaction) {
        // Kiểm tra quyền quản trị viên của người dùng
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            const noPermEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Truy cập bị từ chối')
                .setDescription('Bạn không có quyền sử dụng lệnh này.')
                .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url || interaction.client.user.displayAvatarURL() });

            return interaction.reply({ embeds: [noPermEmbed], ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        const messageType = interaction.options.getString('message_type');
        const title = interaction.options.getString('title');
        const content = interaction.options.getString('content');
        const imageUrl = interaction.options.getString('image_url');
        const plaintext = interaction.options.getString('plaintext');
        const categoryName = interaction.options.getString('category_name') || 'ticket';
        const channelName = interaction.options.getString('channel_name') || 'ticket-here';
        const channelTitle = interaction.options.getString('channel_title');

        if (messageType === 'embed' && (!title || !content)) {
            return interaction.editReply({ content: '❌ Bạn phải cung cấp đầy đủ tiêu đề và nội dung cho tin nhắn embed.', ephemeral: true });
        }

        // Tạo danh mục nếu chưa tồn tại
        let category = interaction.guild.channels.cache.find(c => c.name === categoryName && c.type === ChannelType.GuildCategory);
        if (!category) {
            category = await interaction.guild.channels.create({
                name: categoryName,
                type: ChannelType.GuildCategory,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                ],
            });
        }

        // Tạo kênh ticket nếu chưa tồn tại
        let ticketChannel = interaction.guild.channels.cache.find(c => c.name === channelName && c.type === ChannelType.GuildText && c.parentId === category.id);
        if (!ticketChannel) {
            ticketChannel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        allow: [PermissionFlagsBits.ViewChannel],
                    },
                ],
            });
            if (channelTitle) {
                await ticketChannel.setTopic(channelTitle);
            }
        }

        // Tìm tin nhắn thiết lập ticket hiện có
        const fetchedMessages = await ticketChannel.messages.fetch({ limit: 10 });
        const setupMessage = fetchedMessages.find(msg => msg.author.id === interaction.client.user.id && msg.components.length > 0);

        const button = new ButtonBuilder()
            .setCustomId('create_ticket')
            .setLabel('🎫 Tạo Ticket')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        if (messageType === 'embed') {
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(content)
                .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url || interaction.client.user.displayAvatarURL() });

            if (imageUrl) {
                embed.setImage(imageUrl);
            }

            if (setupMessage) {
                await setupMessage.edit({ content: plaintext || '', embeds: [embed], components: [row] });
            } else {
                await ticketChannel.send({ content: plaintext || '', embeds: [embed], components: [row] });
            }
        } else {
            if (setupMessage) {
                await setupMessage.edit({ content: content, components: [row] });
            } else {
                await ticketChannel.send({ content: content, components: [row] });
            }
        }

        // Phản hồi thành công
        const responseEmbed = new EmbedBuilder()
            .setTitle('🎉 Thành công!')
            .setDescription('Hệ thống ticket đã được thiết lập thành công.')
            .setColor(0x00FF00);

        await interaction.editReply({ embeds: [responseEmbed], ephemeral: true });
    },
};