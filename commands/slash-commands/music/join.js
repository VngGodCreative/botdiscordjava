const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel } = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');
const { footer } = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('🔊 Tham gia kênh voice'),
    category: 'music',

    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({ content: '⚠️ Bạn cần tham gia kênh voice trước!', ephemeral: false });
        }

        if (interaction.guild.members.me.voice.channel && interaction.guild.members.me.voice.channel.id === voiceChannel.id) {
            return interaction.reply({ content: '⚠️ Bot đã ở trong kênh voice này!', ephemeral: false });
        }

        joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('🔊 Đã tham gia kênh voice')
            .setDescription(`Đã tham gia kênh: **${voiceChannel.name}**`)
            .setFooter({
                text: `${footer.text} ${footer.version}`,
                iconURL: footer.icon_url || interaction.client.user.displayAvatarURL(),
            });

        await interaction.reply({ embeds: [embed], ephemeral: false });
    },
};