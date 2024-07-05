const { joinVoiceChannel } = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');
const { footer } = require('../../../config');

module.exports = {
    name: 'join',
    description: 'Tham gia kênh voice',
    category: 'music',
    execute(message) {
        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel) {
            return message.reply('Bạn cần tham gia kênh voice trước!').catch(console.error);
        }

        if (message.guild.members.me.voice.channel && message.guild.members.me.voice.channel.id === voiceChannel.id) {
            return message.reply('Bot đã ở trong kênh voice này!');
        }

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
        });

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('🔊 Đã tham gia kênh voice')
            .setDescription(`Đã tham gia kênh: **${voiceChannel.name}**`)
            .setFooter({
                text: `${footer.text} ${footer.version}`,
                iconURL: message.client.user.displayAvatarURL(),
            });

        message.reply({ embeds: [embed] }).catch(console.error);
    },
};