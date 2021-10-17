require('dotenv').config()

const axios = require('axios').default;
const {Client, Intents, MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');
;
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_VOICE_STATES
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});


const buttonComponent = new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setCustomId('halyava')
            .setLabel('Кликни чтобы забрать халяву')
            .setStyle('PRIMARY'),
    );

client.on('ready', async () => {
    // client.channels.cache.get('713858433589313645').send('@everyone уникальная возможность заработать халяву\n Победитель TI 10: **!!bet <lgd||spirit>**')
});


async function startHalyavaClicker() {
    client.channels.cache.get('897043212475187230').send({
        content: 'Халява, забирайте',
        components: [buttonComponent]
    }).then(res => {
        console.log(res)
        setTimeout(function () {
            prisma.halyavaClicker.findFirst({
                where: {
                    is_active: true
                }
            }).then(res => {
                prisma.halyavaClicker.update({
                    where: {
                        id: res.id
                    },
                    data: {
                        is_active: false
                    }
                })
            })
            res.delete();
        }, 15000)
    })
    await prisma.halyavaClicker.create({
        data: {
            is_active: true,
            total_clicks: 0
        }
    });
}


client.on('interactionCreate', async interaction => {
    // const filter = m => m.customId === 'halyava';
    // const collector = interaction.message.createMessageComponentCollector({
    //     filter,
    //     componentType: 'BUTTON',
    //     time: 15000
    // });
    //
    // collector.on('collect', async m => {
    //     const user = await createUserIfDoesNotExist(interaction.message.member.user)
    //
    //     prisma.halyavaClicker.findFirst({
    //         where: {
    //             is_active: true
    //         }
    //     }).then(async res => {
    //         if (res) {
    //             await prisma.halyavaClickerClick.upsert({
    //                 where: {
    //                     userId_halyavaClickerId: {
    //                         userId: user.id,
    //                         halyavaClickerId: res.id
    //                     }
    //                 },
    //                 create: {
    //                     userId: user.id,
    //                     halyavaClickerId: res.id
    //                 },
    //                 update: {
    //                     clicks: {
    //                         increment: 1
    //                     }
    //                 }
    //             })
    //
    //             await addDiscordScore(user, 1)
    //         }
    //     })
    // })
    //
    // collector.on('end', collected => {
    //
    // })
    // ;
    //
    // await interaction.deferUpdate();
});

client.on('messageCreate', async msg => {
    if (msg.author.bot) return;

    await createUserIfDoesNotExist(msg.member.user).then(async user => {
            console.log(user);
            await addDiscordScore(user, 1)

            if (msg.content.startsWith('!!')) {
                let params = msg.content.replace('!!', '').split(' ');
                let command = params[0]

                if (command === 'bunt') {

                    waitAndDo(15, msg)
                }

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
                        "5. Топ челы - **!!top**\n" +
                        "6. Сделать опрос, максимальное количество вариантов 9 - **!!opros variant1 variant2 variant3**\n" +
                        "7. Привязать аккаунт к боту, например стим - **!!reg steam 12312312**\n" +
                        "8. Случайное число от 1 до 100 - **!!roll**\n" +
                        "9. Халява, быстрее забери ее!!!! - **!!halyava**\n" +
                        "10. ы **!!donate**\n"
                    )
                }

                if (command === 'shuffle') {
                    let params = msg.content.replace('!!shuffle', '').trim().split('>');

                    if (params.length !== 2) {
                        await msg.reply('Неверный синтаксис. \nВот так !!shuffle **войс в котором сидят все**>**Войс в который пнуть половину игроков**\nпример: !!shuffle main voice>second voice')
                        return;
                    }

                    let mainChannel = await msg.guild.channels.cache.find(c => c.name === params[0]);
                    let secondaryChannel = await msg.guild.channels.cache.find(c => c.name === params[1]);

                    if (mainChannel == null || secondaryChannel == null) {
                        await msg.reply(':no_entry_sign: Не найдены данные каналы:no_entry_sign: ')
                        return;
                    }

                    let members = mainChannel.members.sort(() => Math.random() - 0.5)
                    let length = mainChannel.members.size;
                    let counter = 0;

                    for (let [memberID, member] of members) {
                        await member.voice.setChannel(secondaryChannel.id)
                            .then(() => console.log(`Moved ${member.user.tag}.`))
                            .catch(console.error);

                        counter++;

                        if (Math.round(length / 2) === counter) {
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
                    const topCategories = ['discord', 'steam'];
                    let mainText = "";

                    if (typeof params[1] == "undefined") {
                        msg.reply('Впишите по какому топу выдавать результаты. Доступные топы: discord,steam')
                        return;
                    }

                    if (!topCategories.includes(params[1])) {
                        msg.reply('Такого топа нету')
                        return;
                    }

                    let text = "";

                    const exampleEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(mainText)
                        .setDescription('поощрение работяг за их активность на заводе')
                        .setTimestamp()
                        .addField(`Работяга`, ' | ', true)
                        .addField('Награда', ' | ', true)
                        .addField('Поинты', ' | ', true)
                        .setFooter('если вы уверены в смене топа, но ваша позиция не обновилась, перезапустите команду еще раз!\nТоп обновляется каждую неделю');

                    if (params[1] === 'discord') {
                        mainText = "**топ челов сервера по активности**"
                        const users = await prisma.user.findMany({
                            where: {
                                discord_score: {
                                    gt: 0
                                }
                            },
                            orderBy: {
                                discord_score: 'desc'
                            },
                            take: 10
                        })

                        // await msg.guild.roles.fetch('897035307940204574')
                        //     .then(res => {
                        //         res.members.forEach((member, i) => {
                        //             member.roles.remove(res);
                        //         })
                        //         msg.guild.members.fetch(users[0].discord_id)
                        //             .then(async member => {
                        //                 await member.roles.add(res)
                        //             })
                        //
                        //         return res;
                        //     });
                        // await msg.guild.roles.fetch('897035794680782849')
                        //     .then(res => {
                        //         res.members.forEach((member, i) => {
                        //             member.roles.remove(res);
                        //         })
                        //
                        //         msg.guild.members.fetch(users[1].discord_id)
                        //             .then(async member => {
                        //                 await member.roles.add(res)
                        //             })
                        //
                        //         return res;
                        //     });
                        // await msg.guild.roles.fetch('897039738823913502')
                        //     .then(res => {
                        //         res.members.forEach((member, i) => {
                        //             member.roles.remove(res);
                        //         })
                        //
                        //         msg.guild.members.fetch(users[2].discord_id)
                        //             .then(async member => {
                        //                 await member.roles.add(res)
                        //             })
                        //         return res;
                        //     });

                        for (let i = 0; i < users.length; i++) {
                            let roleName = "наград нет, но вы держитесь";

                            if (i === 7) {
                                break;
                            }

                            exampleEmbed.addField(`${i + 1}.` + users[i].name, ' | ', true);
                            exampleEmbed.addField(roleName, ' | ', true);
                            exampleEmbed.addField(`${users[i].discord_score}`, ' | ', true);
                        }
                        await msg.channel.send({embeds: [exampleEmbed]})
                        return;
                    }
                    if (params[1] === 'steam') {

                        let kek = await msg.reply('Загружаю данные...');

                        mainText = "Топ по рейтингу дота(по кс пока невозможно).\nЕсли вас нету в списке зарегистрируйте ваш steam_id коммандой !!reg steam <steam_id>"
                        const users = await prisma.user.findMany({
                            where: {
                                NOT: {
                                    steam_id: ""
                                }
                            }
                        })

                        for (user of users) {
                            await axios.get(`https://api.opendota.com/api/players/${user.steam_id}`)
                                .then(function (response) {
                                    user.mmr = response.data.solo_competitive_rank ?? (response.data.mmr_estimate.estimate ?? 0);
                                })
                                .catch(function (error) {
                                    user.mmr = 0;
                                })
                        }
                        let counter = 1;

                        await users.sort(function (a, b) {
                            return b.mmr - a.mmr;
                        });

                        await kek.delete();

                        await users.forEach((entry) => {
                            text += `${counter}.**${entry.name}** - ${entry.mmr} mmr.\n`
                            counter++;
                        })

                        msg.channel.send(text)
                    }
                }

                if (command === 'opros') {
                    const choices = params.slice(1, params.length);

                    if (choices.length > 9) {
                        msg.reply("Максимальное количество вариантов 9");
                        return;
                    }

                    const reactions = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

                    let text = "";
                    let counter = 1;

                    for (choice of choices) {
                        text += `${counter} - **${choice}**, `;
                        counter++;
                    }

                    msg.channel.send(`Опрос:\n ${text}`)
                        .then(message => {
                            let counter = 0;
                            for (choice of choices) {
                                message.react(`${reactions[counter]}`);
                                counter++;
                            }
                        })
                }

                if (command === 'reg') {
                    if (params[1] === 'steam') {
                        if (typeof params[2] != "undefined") {
                            await prisma.user.update({
                                where: {
                                    id: user.id
                                },
                                data: {
                                    steam_id: params[2]
                                }
                            })
                            await msg.reply(`Стим айди ${params[2]} зареган под ${user.name}`)
                        }
                    }
                }

                if (command === 'roll') {
                    let randomNumber = await Math.floor(Math.random() * 100)
                    await msg.reply(`${randomNumber}`)
                }

                if (command === 'donate') {
                    await msg.reply(`Каспи: +7 747 9819279\nна буст сервера конечно же`)
                }

                if (command === 'halyava') {
                    var threeHoursBefore = new Date();
                    threeHoursBefore.setHours(threeHoursBefore.getHours() - 3);

                    const lastHalyava = await prisma.halyava.findFirst({
                        where: {
                            createdAt: {
                                gte: threeHoursBefore
                            }
                        }
                    })

                    if (lastHalyava) {
                        let lastHalyavaDate = new Date(lastHalyava.createdAt)
                        let nextHalyavaDate = new Date(lastHalyavaDate.setHours(lastHalyavaDate.getHours() + 3))
                        let nextHalyavaSecondsLeft = (nextHalyavaDate.getTime() - (new Date).getTime()) / 1000

                        msg.reply(`Следующая халява будет доступна через ${nextHalyavaSecondsLeft} секунд`)
                        return;
                    } else {
                        await prisma.user.update({
                            where: {
                                id: user.id
                            },
                            data: {
                                discord_score: user.discord_score + 50
                            }
                        })

                        await prisma.halyava.create({
                            data: {
                                looterId: user.id,
                                createdAt: new Date()
                            }
                        });
                        msg.channel.send(`**${user.name} сорвал халяву!** 🙀`)
                    }
                }

                if (command === 'bet') {

                    console.log(params)
                    if (user.have_bet) {
                        await msg.reply('You have bet already!');
                        return;
                    }
                    const team = params[1].toLowerCase();

                    if (team !== 'lgd' && team !== 'spirit') {
                        await msg.reply(' Error,lgd || spirit')
                        return;
                    }

                    await prisma.user.update({
                        where: {
                            id: user.id
                        },
                        data: {
                            have_bet: true,
                            bet_amount: user.discord_score,
                            bet_for: params[1]
                        }
                    });

                    await msg.reply(`Ставка поставлена, возможный ваш выигрыш:${user.discord_score * 2}`);
                }

                if (command === 'finishBet') {

                    let lostCommand = "";
                    if (params[1] === 'spirit') {
                        lostCommand = 'lgd'
                    } else {
                        lostCommand = 'spirit'
                    }

                    const users = await prisma.user.findMany({
                        where: {
                            have_bet: true,
                            bet_for: params[1]
                        }
                    });
                    const len = users.length;
                    let text = ""
                    for (let i = 0; i < len; i++) {
                        await prisma.user.update({
                            where: {
                                id: users[i].id,
                            },
                            data: {
                                discord_score: users[i].discord_score * 2
                            }
                        })
                        text += `${i + 1}.${users[i].name}, выигрыш - ${users[i].discord_score * 2}\n`
                    }

                    await msg.channel.send('Поздравляем тех кто поставил на TEAM SPIRIT\n' + text)

                    const lostUsers = await prisma.user.findMany({
                        where: {
                            have_bet: true,
                            bet_for: lostCommand
                        }
                    });

                    if (lostUsers.length === 0) {
                        return;
                    }

                    let lostLen = lostUsers.length;

                    for (let i = 0; i < lostLen; i++) {
                        await prisma.user.update({
                            where: {
                                id: users[i].id,
                            },
                            data: {
                                discord_score: 0
                            }
                        })
                        text += `${i + 1}.${users[i].name} - 0\n`
                    }

                    await msg.channel.send('Лузеры:\n' + text)

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
        }
    )
})

client.on('guildMemberAdd', async (member) => {
    console.log('MEMBER ADDED')
    const channel = member.guild.channels.cache.find(channel => channel.name === "🧑🏭-welcome");
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
            discord_id: user.id,
            name: user.username
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
    }).then(res => {
    })
}

function waitAndDo(times, msg) {
    if (times < 0) {
        return;
    }

    setTimeout(function () {
        if (times === 1) {
            msg.channel.send(`Удаление сервера пройзойдет через: ${times}`)
                .then(res => {
                    res.reply('де наебка')
                });
            return;
        } else {
            msg.channel.send(`Удаление сервера пройзойдет через: ${times}`)
        }
        waitAndDo(times - 1, msg);
    }, 1000);
}
