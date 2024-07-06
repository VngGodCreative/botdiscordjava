const { SlashCommandBuilder } = require('@discordjs/builders');
const { footer } = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('🚫 Cấm người dùng khỏi máy chủ')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('Người dùng cần cấm')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Lý do cấm')
                .setRequired(false)),
    category: 'admin',

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'Không có lý do được cung cấp';
        const member = interaction.guild.members.cache.get(target.id);
        const botMember = interaction.guild.members.cache.get(interaction.client.user.id);

        if (!member) {
            return interaction.reply({ content: '❌ Người dùng không tồn tại trong máy chủ này.', ephemeral: true });
        }

        if (!botMember.permissions.has('BAN_MEMBERS')) {
            return interaction.reply({ content: '❌ Bot không có quyền cấm người dùng.', ephemeral: true });
        }

        if (member.roles.highest.position >= botMember.roles.highest.position) {
            return interaction.reply({ content: '❌ Bot không thể cấm người dùng này vì họ có quyền cao hơn hoặc bằng bot.', ephemeral: true });
        }

        try {
            await member.ban({ reason });
            await interaction.reply({
                embeds: [
                    {
                        color: 0xff0000,
                        title: `🚫 Đã cấm ${target.username} khỏi máy chủ ${interaction.guild.name}`,
                        fields: [
                            { name: '👤 Tag Discord', value: `<@${target.id}>`, inline: true },
                            { name: '🆔 ID người dùng', value: `${target.id}`, inline: true },
                            { name: '📝 Lý do', value: `${reason}`, inline: false }
                        ],
                        footer: {text: `${footer.text} ${footer.version}`, icon_url: footer.icon_url || interaction.client.user.displayAvatarURL(),
                        },
                    }
                ],
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Có lỗi xảy ra khi cấm người dùng.', ephemeral: true });
        }
    },
};