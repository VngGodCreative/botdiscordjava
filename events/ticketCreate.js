const { EmbedBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { footer } = require('../config');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.isButton()) {
            if (interaction.customId === 'create_ticket') {
                const randomNumber = Math.floor(Math.random() * 10000);
                const channelName = `${interaction.user.username}-ticket-${randomNumber}`;
                const topic = `Ticket hỗ trợ của ${interaction.user.username} số ${randomNumber}`;

                const category = interaction.guild.channels.cache.find(c => c.name === 'ticket' && c.type === ChannelType.GuildCategory);

                if (!category) {
                    return interaction.reply({ content: '❌ Không tìm thấy danh mục ticket. Vui lòng thiết lập danh mục trước.', ephemeral: true });
                }

                const ticketChannel = await interaction.guild.channels.create({
                    name: channelName,
                    type: ChannelType.GuildText,
                    topic: topic,
                    parent: category.id,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionFlagsBits.ViewChannel],
                        },
                        {
                            id: interaction.user.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                        },
                    ],
                });

                const closeButton = new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('🔒 Đóng Ticket')
                    .setStyle(ButtonStyle.Danger);

                const row = new ActionRowBuilder().addComponents(closeButton);

                const ticketCreatedEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle(`🎫 Ticket của ${interaction.user.username} đã được tạo`)
                    .setDescription(`Ticket của bạn đã được tạo thành công.\nVui lòng vào kênh ${ticketChannel} để được hỗ trợ.`)
                    .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url || interaction.client.user.displayAvatarURL() });

                await interaction.reply({ embeds: [ticketCreatedEmbed], ephemeral: true });

                const ticketChannelEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle(`🎫 Phiếu hỗ trợ số ${randomNumber}`)
                    .setDescription(`Chào bạn <@${interaction.user.id}>, đây là phiếu hỗ trợ của bạn, vui lòng nêu vấn đề bạn đang gặp phải.\nNếu bạn đã giải quyết được vấn đề, vui lòng đóng ticket bằng cách bấm nút màu đỏ phía dưới.`)
                    .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url || interaction.client.user.displayAvatarURL() });

                await ticketChannel.send({ embeds: [ticketChannelEmbed], components: [row] });
                await ticketChannel.send(`<@${interaction.user.id}>`);

                const timer = setTimeout(async () => {
                    try {
                        const messages = await ticketChannel.messages.fetch({ limit: 1 });
                        if (messages.size === 0 || (messages.size === 1 && messages.first().author.bot)) {
                            await ticketChannel.delete('Không có hoạt động trong 5 phút');
                        }
                    } catch (error) {
                        // Không log lỗi để tránh spam log khi kênh không tồn tại
                    }
                }, 5 * 60 * 1000);

                const filter = m => !m.author.bot;
                const collector = ticketChannel.createMessageCollector({ filter, time: 5 * 60 * 1000 });

                collector.on('collect', () => {
                    clearTimeout(timer);
                });

                collector.on('end', async collected => {
                    if (collected.size === 0) {
                        try {
                            await ticketChannel.delete('Không có hoạt động trong 5 phút');
                        } catch (error) {
                            // Không log lỗi để tránh spam log khi kênh không tồn tại
                        }
                    }
                });
            } else if (interaction.customId === 'close_ticket') {
                const ticketChannel = interaction.channel;
                if (ticketChannel) {
                    const closeButton = new ButtonBuilder()
                        .setCustomId('closed_ticket')
                        .setLabel('🔒 Ticket đã đóng')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true);

                    const row = new ActionRowBuilder().addComponents(closeButton);

                    await interaction.update({ components: [row] });

                    const closeEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle(`🔒 Ticket ${interaction.user.username} đã được đóng`)
                        .setDescription(`Ticket của <@${interaction.user.id}> đã được đóng, kênh này sẽ được xóa sau 5 giây.`)
                        .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url || interaction.client.user.displayAvatarURL() });

                    await ticketChannel.send({ embeds: [closeEmbed] });

                    let countdown = 5;
                    const countdownMessage = await ticketChannel.send(`Ticket sẽ được xóa trong ${countdown} giây...`);

                    const countdownInterval = setInterval(async () => {
                        countdown -= 1;
                        if (countdown > 0) {
                            await countdownMessage.edit(`Ticket sẽ được xóa trong ${countdown} giây...`);
                        } else {
                            clearInterval(countdownInterval);
                            await countdownMessage.delete();
                            try {
                                await ticketChannel.delete('Ticket đã được đóng');
                            } catch (error) {
                                // Không log lỗi để tránh spam log khi kênh không tồn tại
                            }
                        }
                    }, 1000);
                }
            }
        }
    },
};