require('dotenv').config()

const {Client, Intents} = require('discord.js');
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

client.on('ready', () => {
    console.log(client.user.tag)
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const {commandName} = interaction;

    if (commandName === 'about') {
        console.log(interaction)
        await interaction.reply("Brigadir v0.0.1, https://github.com/sabadoryo/Brigadir");
    }
});

client.on('messageCreate', async msg => {
    if (msg.author.bot) return;

    await createUserIfDoesNotExist(msg.member.user).then(async user => {
        console.log(user);
        await addDiscordScore(user, 1)

        if (msg.content.startsWith('!!')) {
            let params = msg.content.replace('!!', '').split(' ');
            let command = params[0]

            if (command === 'rc') {
                if (params.length !== 3) {
                    await msg.reply('Неверный синтаксис. Вот так !!rc {дело} {количество работяг} ,пример: !!rc Дота 10')
                    return;
                }

                if (!isNumeric(params[2])) {
                    await msg.reply('Эм ты можешь вписать количество 2ым параметром, чел?')
                    return;
                }

                const call = await prisma.call.findFirst({
                    where: {
                        is_active: true
                    }
                })

                if (call) {
                    await msg.reply(`Сейчас уже идет сбор на ${call.name}`)
                    return;
                }

                await prisma.call.create({
                    data: {
                        is_active: true,
                        cur_user_amount: 0,
                        user_amount_limit: parseInt(params[2]),
                        name: params[1]
                    }
                })

                await msg.channel.send(`@everyone Набираю **${params[2]}** работяг на ${params[1]}.\n + в чат если за`)
            }

            if (command === 'cancel') {
                if (params.length !== 2) {
                    await msg.reply('Неверный синтаксис, !!cancel <commandName>')
                    return;
                }

                const call = await prisma.call.findFirst({
                    where: {
                        is_active: true
                    }
                })

                if (call) {
                    await prisma.call.update({
                        where: {
                            id: call.id
                        },
                        data: {
                            is_active: false
                        }
                    })
                    await msg.reply(`Созыв работяг на **${call.name}** отменен!`)
                }
            }

            if (command === 'help') {
                await msg.reply(
                    "Список доступных комманд:\n" +
                    "1. Rabotyagi call - **!!rc <названиеДела> <нужное количество работяг>**\n" +
                    "2. Cancel rabotyagi call - **!!cancel rc**\n" +
                    "3. Кто же этот бригадир - **!!introduce**\n" +
                    "4. Распределить игроков в одной из комнат в другую в равном количестве - **!!shuffle channel 1>channel 2**\n" +
                    "5. Топ челы - **!!top**\n"
                )
            }

            if (command === 'shuffle') {
                const params = msg.content.replace('!!shuffle', '').trim().split('>');

                if (params.length != 2) {
                    await msg.reply('Неверный синтаксис. \nВот так !!shuffle **войс в котором сидят все**>**Войс в который пнуть половину игроков**\nпример: !!shuffle main voice>second voice')
                    return;
                }

                const mainChannel = msg.guild.channels.cache.find(c => c.name === params[0] && c.type === 'GUILD_VOICE');
                const secondaryChannel = msg.guild.channels.cache.find(c => c.name === params[1] && c.type === 'GUILD_VOICE');

                if (mainChannel == null || secondaryChannel == null) {
                    await msg.reply(':no_entry_sign: Не найдены данные каналы:no_entry_sign: ')
                    return;
                }

                const members = mainChannel.members.sort(() => Math.random() - 0.5)
                const length = mainChannel.members.size;

                let counter = 0;

                for (const [memberID, member] of members) {
                    member.voice.setChannel(secondaryChannel.id)
                        .then(() => console.log(`Moved ${member.user.tag}.`))
                        .catch(console.error);

                    counter++;

                    if (Math.round(length / 2) == counter) {
                        break;
                    }
                }

                await msg.reply(
                    ":white_check_mark: **Распределение окончено!**:white_check_mark:" +
                    "**не забудьте включить микрофоны после распределния**"
                )
            }

            if (command === 'introduce') {
                await msg.channel.send({content: 'Бригадир завода', files: ['./static/img/brigadir.jpg']})
            }

            if (command === 'top') {
                let text = "";

                const users = await prisma.user.findMany({
                    where: {
                        discord_score: {
                            gt: 0
                        }
                    },
                    orderBy: {
                        discord_score: 'desc'
                    }
                })

                let counter = 1;

                users.forEach((entry) => {
                    text += `${counter}.**${entry.name}** - ${entry.discord_score} pts.\n`
                    counter++;
                })

                await msg.channel.send("**топ челов сервера**:\n" + text)
            }
        }
        if (msg.content === '+') {

            const call = await prisma.call.findFirst({
                where: {
                    is_active: true
                }
            })

            if (call) {
                const userAlreadyConnectedToCall = await prisma.callsUsers.findFirst({
                    where: {
                        userId: user.id,
                        callId: call.id
                    }
                })

                let callCopy = call;

                if (userAlreadyConnectedToCall == null) {
                    const call = await prisma.call.update({
                        where: {
                            id: callCopy.id
                        },
                        data: {
                            users: {
                                create: [
                                    {
                                        user: {
                                            connect: {id: user.id}
                                        }
                                    }
                                ]
                            },
                            cur_user_amount: callCopy.cur_user_amount + 1
                        },
                    })

                    let left = call.user_amount_limit - call.cur_user_amount;

                    if (left > 0) {
                        prisma.$executeRaw`update "Call" set cur_user_amount = cur_user_amount + 1 where id = ${call.id}`
                    }

                    if (Math.round(call.user_amount_limit / 2) === left) {
                        await msg.channel.send(`@everyone Осталось добрать ${call.user_amount_limit - call.cur_user_amount} работяг`)
                    }

                    if (left === 0) {
                        await prisma.call.update({
                            where: {
                                id: call.id
                            },
                            data: {
                                is_active: false
                            }
                        })

                        let list = await prisma.call.findFirst({
                            where: {
                                id: call.id
                            },
                            include: {
                                users: {
                                    include: {
                                        user: true
                                    }
                                }
                            }
                        })

                        let message = "";

                        list.users.forEach(elem => {
                            message += `**${elem.user.name}**` + "\n";
                        })

                        await msg.channel.send(`Сбор закрыт, список работяг в ${call.name}:\n` + message)
                    }
                }
            }
        }
    })
})

client.on('guildMemberAdd', async (member) => {
    console.log('MEMBER ADDED')
    const channel = member.guild.channels.cache.find(channel => channel.name === "welcome");
    await channel.send({
        content: "**Добро пожаловать на завод!**\nДобавь реакцию серпа, чтобы залутать фри звание",
        files: [
            './static/img/zavod.jpg'
        ]
    }).then(message => {
        message.react("⛏️")
    });
})

client.on('messageReactionAdd', async (reaction, usr) => {
    if (!usr.bot) {

        const user = await createUserIfDoesNotExist(usr).then(res => {
            addDiscordScore(res, 2)
        })

        if (reaction.emoji.name === '⛏️') {
            const role = reaction.message.guild.roles.cache.find(r => r.name === 'Чел');
            const guild = reaction.message.guild;
            const memberWhoReacted = guild.members.cache.find(member => member.id === usr.id);

            memberWhoReacted.roles.add(role);
        }
    }
})

client.login(process.env.TOKEN);


function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function createUserIfDoesNotExist(user) {
    return prisma.user.upsert({
        where: {
            discord_id: user.id
        },
        create: {
            discord_id: user.id,
            name: user.username,
            discord_score: 0
        },
        update: {
            discord_id: user.id
        }
    });
}

function addDiscordScore(user, point) {
    prisma.user.update({
        where: {
            discord_id: user.discord_id
        },
        data: {
            discord_score: user.discord_score + point
        }
    }).then(res => {})
}
