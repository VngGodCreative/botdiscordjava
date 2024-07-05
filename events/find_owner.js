const { joinVoiceChannel, entersState, VoiceConnectionStatus } = require('@discordjs/voice');
const { ownerId, ready } = require('../config');

module.exports = {
    name: 'find_owner',
    execute(client) {
        console.log(`${ready.infoPrefix} ${ready.emojis.search} Đang bắt đầu tìm chủ bot ở các kênh trên server...`);

        let ownerFound = false;

        client.guilds.cache.forEach(guild => {
            guild.channels.cache.forEach(channel => {
                if (channel.type === 'GUILD_VOICE' || channel.type === 2) { // Check for voice channels
                    channel.members.forEach(member => {
                        if (member.id === ownerId) {
                            ownerFound = true;
                            console.log(`${ready.joinPrefix} ${ready.emojis.join} Đã tìm thấy chủ bot ở server ${guild.name} - kênh voice ${channel.name}, đang tiến hành tham gia kênh thoại...`);

                            const connection = joinVoiceChannel({
                                channelId: channel.id,
                                guildId: guild.id,
                                adapterCreator: guild.voiceAdapterCreator,
                            });

                            connection.on(VoiceConnectionStatus.Ready, () => {
                                console.log(`${ready.joinPrefix} ${ready.emojis.join} Đã tham gia kênh voice ${channel.name} thành công.`);
                            });
                        }
                    });
                }
            });
        });

        if (!ownerFound) {
            console.log(`${ready.infoPrefix} Không tìm thấy chủ bot ở trên các server.`);
        }
    },
};