const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { footer } = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stealemoji')
        .setDescription('🖼️ Cướp emoji từ link hoặc emoji người dùng cung cấp.')
        .addStringOption(option => 
            option.setName('name')
                .setDescription('Tên của emoji')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('input')
                .setDescription('Emoji hoặc link của emoji')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const name = interaction.options.getString('name');
        const input = interaction.options.getString('input');
        const botMember = interaction.guild.members.cache.get(interaction.client.user.id);

        // Kiểm tra quyền quản trị viên của người dùng
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🚫 Thiếu Quyền')
                .setDescription('Bạn không có quyền sử dụng lệnh này.')
                .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url || interaction.client.user.displayAvatarURL() });

            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        // Kiểm tra quyền quản trị viên của bot
        if (!botMember.permissions.has(PermissionFlagsBits.ManageEmojisAndStickers)) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🚫 Thiếu Quyền')
                .setDescription('Bot không có quyền quản lý emoji và sticker.')
                .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url || interaction.client.user.displayAvatarURL() });

            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        if (!name || !input) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🚫 Thiếu Thông Tin')
                .setDescription('Vui lòng cung cấp tên và emoji hoặc link cho emoji.')
                .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url || interaction.client.user.displayAvatarURL() });

            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        let imageUrl;
        const customEmoji = input.match(/<:\w+:(\d+)>/);
        if (customEmoji) {
            imageUrl = `https://cdn.discordapp.com/emojis/${customEmoji[1]}.png`;
        } else if (input.startsWith('http')) {
            imageUrl = input;
        } else {
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🚫 Lỗi Định Dạng')
                .setDescription('Emoji hoặc link không hợp lệ.')
                .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url || interaction.client.user.displayAvatarURL() });

            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        interaction.guild.emojis.create({ attachment: imageUrl, name: name })
            .then(emoji => {
                const successEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('✅ Cướp Emoji Thành Công')
                    .setDescription(`Emoji ${emoji} đã được cướp về server với tên \`${name}\`!`)
                    .setImage(imageUrl)
                    .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url || interaction.client.user.displayAvatarURL() });

                interaction.reply({ embeds: [successEmbed], ephemeral: false });
            })
            .catch(error => {
                console.error(error);
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('🚫 Lỗi Cướp Emoji')
                    .setDescription('Có lỗi khi cướp emoji vào server. ❌')
                    .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url || interaction.client.user.displayAvatarURL() });

                interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            });
    },
};