const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('Я бригадир этого завода, мне похуй')
};
