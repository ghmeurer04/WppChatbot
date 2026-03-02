const { Client, LocalAuth } = require('whatsapp-web.js');

exports.initialize_client = function (clientId = 'bot-main', phoneNumber = null) {
    const client = new Client({
        puppeteer: {
            headless: true,
            executablePath: '/usr/bin/google-chrome',
            args: [
                '--no-sandbox',
                '--disable-gpu',
            ]
        },
        authStrategy: new LocalAuth({
            clientId
        }),
        ...(phoneNumber
            ? {
                pairWithPhoneNumber: {
                    phoneNumber,
                    showNotification: true
                }
            }
            : {})
    });

    return client;
};
