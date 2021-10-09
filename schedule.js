const schedule = require('node-schedule');

var rule = new schedule.RecurrenceRule();

rule.minutes = 30;

schedule.scheduleJob(rule, async function () {
    let image = "";
    await axios.get(`https://nekobot.xyz/api/image?type=neko`)
        .then(function (response) {
            console.log(response);
            console.log('sent message to my love')
            image = response.data.message;
        })
        .catch(function (error) {
            console.log(error)
        })

    const user = await client.users.fetch('401046879015534592');
    user.send({files: [`${image}`], content: "Прости плз:c"});
});
