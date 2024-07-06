const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { footer } = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('🔓 Bỏ cấm người dùng khỏi máy chủ')
        .addStringOption(option =>
            option.setName('user_id')
                .setDescription('ID của người dùng cần bỏ cấm')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Lý do bỏ cấm')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    category: 'admin',

    async execute(interaction) {
        const userId = interaction.options.getString('user_id');
        const reason = interaction.options.getString('reason') || 'Không có lý do được cung cấp';

        // Kiểm tra quyền quản trị viên của người dùng
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            const noPermEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Truy cập bị từ chối')
                .setDescription('Bạn không có quyền sử dụng lệnh này.')
                .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url || interaction.client.user.displayAvatarURL() });

            return interaction.reply({ embeds: [noPermEmbed], ephemeral: true });
        }

        try {
            const user = await interaction.client.users.fetch(userId);
            await interaction.guild.bans.remove(userId, reason);

            const successEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle(`🔓 Đã gỡ lệnh cấm với ${user.username} khỏi máy chủ ${interaction.guild.name}`)
                .addFields(
                    { name: '👤 Tag Discord', value: `<@${userId}>`, inline: true },
                    { name: '🆔 ID người dùng', value: `${userId}`, inline: true },
                    { name: '📝 Lý do', value: `${reason}`, inline: false }
                )
                .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url || interaction.client.user.displayAvatarURL() });

            await interaction.reply({ embeds: [successEmbed], ephemeral: false });
        } catch (error) {
            console.error(error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🚫 Lỗi Bỏ Cấm')
                .setDescription('Có lỗi xảy ra khi bỏ cấm người dùng. ❌')
                .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url || interaction.client.user.displayAvatarURL() });

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};