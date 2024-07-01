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

        if (!member) {
            return interaction.reply({ content: 'Người dùng không tồn tại trong máy chủ này.', ephemeral: true });
        }

        try {
            await member.ban({ reason });
            await interaction.reply({
                embeds: [
                    {
                        color: 0xff0000,
                        title: '🚫 Đã cấm thành công',
                        description: `Người dùng ${target.tag} đã bị cấm.\nLý do: ${reason}`,
                        footer: {
                            text: `${footer.text} - ${require('../config').version}`,
                            icon_url: interaction.client.user.displayAvatarURL(),
                        },
                    }
                ],
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Có lỗi xảy ra khi cấm người dùng.', ephemeral: true });
        }
    },
};