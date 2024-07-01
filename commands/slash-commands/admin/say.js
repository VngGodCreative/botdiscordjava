const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { version, footer } = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('📢 🗣️ Làm cho bot nói một điều gì đó')
        .addStringOption(option => 
            option.setName('type')
                .setDescription('Loại tin nhắn')
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
            option.setName('title')
                .setDescription('📝 Tiêu đề (chỉ dành cho embed)')
                .setRequired(false))
        .addStringOption(option => 
            option.setName('image')
                .setDescription('🖼️ URL hình ảnh (chỉ dành cho embed)')
                .setRequired(false))
        .addStringOption(option => 
            option.setName('footer')
                .setDescription('🔻 Footer (chỉ dành cho embed)')
                .setRequired(false)),
    category: 'admin',
    usage: '/say <type> <message> [title] [image] [footer]',
    
    async execute(interaction) {
        const type = interaction.options.getString('type');
        const messageContent = interaction.options.getString('message');
        const title = interaction.options.getString('title');
        const image = interaction.options.getString('image');
        const customFooter = interaction.options.getString('footer');

        if (type === 'plaintext') {
            await interaction.channel.send(messageContent);
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#00ff00')
                        .setTitle('✅ Thành công')
                        .setDescription('Tin nhắn đã được gửi dưới dạng plaintext!')
                        .setFooter({
                            text: `${footer.text} - ${footer.version}`,
                            iconURL: footer.icon_url || interaction.client.user.displayAvatarURL()
                        })
                ],
                ephemeral: true
            });
        } else if (type === 'embed') {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(title || '📢 Tin nhắn từ bot')
                .setDescription(messageContent)
                .setFooter({
                    text: customFooter || `${footer.text} - ${footer.version}`,
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
                            text: `${footer.text} - ${footer.version}`,
                            iconURL: footer.icon_url || interaction.client.user.displayAvatarURL()
                        })
                ],
                ephemeral: true
            });
        }
    },
};