const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');
const { footer } = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('24-7')
        .setDescription('📡 Duy trì bot trong kênh thoại 24/7'),
    async execute(interaction) {
        const channel = interaction.member.voice.channel;

        if (!channel) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Lỗi')
                    .setDescription('Bạn cần ở trong một kênh thoại để sử dụng lệnh này.')
                    .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url || interaction.client.user.displayAvatarURL() })]
            });
        }

        try {
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });

            connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
                try {
                    await Promise.race([
                        entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                        entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                    ]);
                    // Seems to be reconnecting to a new channel - ignore disconnect
                } catch (error) {
                    // Seems to be a real disconnect which shouldn't be recovered from
                    connection.destroy();
                }
            });

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('📡 Bot đang duy trì trong kênh thoại 24/7')
                .setDescription('Bot sẽ duy trì kết nối với kênh thoại này cho đến khi bạn ngắt kết nối hoặc bot bị khởi động lại.')
                .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url || interaction.client.user.displayAvatarURL() });

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Lỗi')
                    .setDescription('Không thể kết nối vào kênh thoại.')
                    .setFooter({ text: `${footer.text} ${footer.version}`, iconURL: footer.icon_url || interaction.client.user.displayAvatarURL() })]
            });
        }
    },
};