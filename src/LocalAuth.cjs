const { Client, LocalAuth } = require('whatsapp-web.js');


exports.initialize_client = function(){

    const client = new Client({
        puppeteer: {
            headless: true,
            executablePath: '/usr/bin/google-chrome',
            args: [
                '--no-sandbox',
                '--disable-gpu',
            ]
        }
    })

    /*const client = new Client(
        {
            puppeteer: {
            headless: true,
            executablePath: '/usr/bin/google-chrome',
            args: [
                '--no-sandbox',
                '--disable-gpu',
            ]
            },
            authStrategy: new LocalAuth({
                clientId: 'bot-main' // important
            }),
            pairWithPhoneNumber: [{
                phoneNumber: "556781032093",
                showNotification: true,
            },{
                phoneNumber: "5567981039492",
                showNotification: true,
            }],
        }
    );*/
    return client
}

