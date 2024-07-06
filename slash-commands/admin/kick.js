const { SlashCommandBuilder } = require('@discordjs/builders');
const { footer } = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('👢 Kick người dùng khỏi máy chủ')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('Người dùng cần kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Lý do kick')
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

        if (!botMember.permissions.has('KICK_MEMBERS')) {
            return interaction.reply({ content: '❌ Bot không có quyền kick người dùng.', ephemeral: true });
        }

        if (member.roles.highest.position >= botMember.roles.highest.position) {
            return interaction.reply({ content: '❌ Bot không thể kick người dùng này vì họ có quyền cao hơn hoặc bằng bot.', ephemeral: true });
        }

        try {
            await member.kick(reason);
            await interaction.reply({
                embeds: [
                    {
                        color: 0xff0000,
                        title: `👢 Đã kick ${target.username} khỏi máy chủ ${interaction.guild.name}`,
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
            await interaction.reply({ content: '❌ Có lỗi xảy ra khi kick người dùng.', ephemeral: true });
        }
    },
};