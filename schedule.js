const schedule = require('node-schedule');

var rule = new schedule.RecurrenceRule();

rule.minutes = 30;

schedule.scheduleJob(rule, async function () {
    let image = "";
    let caption = "";

    await axios.get(`https://some-random-api.ml/meme`)
        .then(function (response) {
            console.log(response);
            console.log('sent message to my love')
            image = response.data.image;
            caption = response.data.caption
        })
        .catch(function (error) {
            console.log(error)
        })

    const channel = await client.channels.fetch('894551552281444363');
    channel.send({files: [`${image}`], content: caption});
});
