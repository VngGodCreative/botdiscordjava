const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { footer } = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('📋 Hiển thị thông tin về người dùng')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('Người dùng bạn muốn kiểm tra')
                .setRequired(false)),
    category: 'info',

    async execute(interaction) {
        const user = interaction.options.getUser('target') || interaction.user;

        const member = interaction.guild.members.cache.get(user.id);
        const createdAt = `${user.createdAt.toLocaleTimeString('vi-VN')} - ${user.createdAt.toLocaleDateString('vi-VN')}`;
        const joinedAt = member ? `${member.joinedAt.toLocaleTimeString('vi-VN')} - ${member.joinedAt.toLocaleDateString('vi-VN')}` : 'Không xác định';
        const roles = member ? member.roles.cache.filter(role => role.name !== '@everyone').map(role => `<@&${role.id}>`).join(', ') : 'Không có vai trò';

        const embed = new EmbedBuilder()
            .setColor(0x00AE86)
            .setTitle('📋 Thông tin người dùng được gọi')
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '👤 Tên Discord', value: `<@${user.id}>`, inline: true },
                { name: '🏷️ Tên Tag', value: `${user.tag}`, inline: true },
                { name: '🆔 ID', value: user.id, inline: true },
                { name: '📅 Ngày tạo tài khoản', value: createdAt, inline: true },
                { name: '🔗 Ngày tham gia server', value: joinedAt, inline: true },
                { name: '🏷️ Vai trò', value: roles, inline: false }
            )
            .setFooter({
                text: `${footer.text} - ${footer.version} | ${new Date().toLocaleTimeString('vi-VN')} - ${new Date().toLocaleDateString('vi-VN')}`,
                iconURL: footer.icon_url || interaction.client.user.displayAvatarURL()
            });

        interaction.reply({ embeds: [embed] });
    },
};