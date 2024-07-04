const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { footer } = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('🔍 Hiển thị ảnh đại diện của một người dùng')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Người dùng mà bạn muốn xem ảnh đại diện')
                .setRequired(false)),
    category: 'info',

    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 1024 });

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(`Ảnh đại diện của ${user.username}`)
            .setImage(avatarUrl)
            .addFields(
                { name: 'JPG', value: `[Link tải ảnh](${user.displayAvatarURL({ format: 'jpg' })})`, inline: true },
                { name: 'PNG', value: `[Link tải ảnh](${user.displayAvatarURL({ format: 'png' })})`, inline: true },
                { name: 'WEBP', value: `[Link tải ảnh](${user.displayAvatarURL({ format: 'webp' })})`, inline: true }
            )
            .setFooter({
                text: `${footer.text} ${footer.version}`,
                iconURL: interaction.client.user.displayAvatarURL()
            });

        if (avatarUrl.endsWith('.gif')) {
            embed.addFields({ name: 'GIF', value: `[Link tải ảnh động](${avatarUrl})`, inline: true });
        }

        await interaction.reply({ embeds: [embed] });
    },
};