// Import necessary modules
import * as db from './database.mjs'; // Database operations
import * as messages from './messages.js'; // Message templates
import qrcode from 'qrcode-terminal'; // QR code generation
import * as localAuth from './LocalAuth.cjs'; // Local authentication for WhatsApp client
import * as f from './functions.js'; // Helper functions


// Constants for message handling
let MIN_TIME = 4000; // Minimum time delay for typing indicator
let MAX_TIME = 6000; // Maximum time delay for typing indicator
let REQUEST_LIMIT = 300; // Limit for user requests


// Initialize WhatsApp client
const client = localAuth.initialize_client();


// Event: Handle QR code generation for client authentication
client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

// Event: Log linking code for client
client.on('code', (code) => {
    console.log("Linking code:", code);
});


// Event: Client ready state
client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado.');
    db.initialize(); // Initialize database
    f.sendToWhatsApp(client); // Send initial WhatsApp connection message
});

client.initialize(); // Begin client initialization


// Event: Handle incoming messages
client.on('message', async msg => {
    try {
        // Fetch contact and message details
        const contact = await msg.getContact();
        const number = contact.id._serialized; // User phone number
        const name = contact.pushname; // User name
        console.log(number, msg.from, msg.body);
        let variant = 'cida'
        

        // Check if user is registered
        const user = await db.find('users', {"phone_number": {$eq: number}});
        if(user[0].hasOwnProperty("variant")){
            variant = user[0].variant
        }
        msg.body = msg.body.toLowerCase().trim(); // Normalize message text


        const chat = await msg.getChat();
        await f.delay(db.getRandomInt(MIN_TIME, MAX_TIME)); // Delay
        await chat.sendStateTyping(); // Send typing indicator
        await f.delay(db.getRandomInt(MIN_TIME, MAX_TIME));


        await f.retry(async () => {

            // Check if user is not registered
            if (user.length == 0) {
                //await client.sendMessage(msg.from, messages.get_message_unregistered(name));
            }

            // Handle request limit
            else if (user[0].requests > REQUEST_LIMIT + 10) {
                // Do nothing if beyond extended limit
            }
            else if (user[0].requests > REQUEST_LIMIT) {
                await client.sendMessage(msg.from, messages.get_message_limit(name));
                await db.update('users', {"phone_number": {$eq: number}}, {$set: {"requests": REQUEST_LIMIT + 1}});
            }


            // Handle known commands

            // Menu
            else if (msg.body == 'menu') {
                await client.sendMessage(msg.from, messages.get_message_menu(name,variant));
            }

            // Check Due Date
            else if (msg.body == 'vencimento') {
                var date = new Date(user[0].due_date);
                await client.sendMessage(msg.from, messages.get_message_duedate(name, date));
            }

            // Handle Entries
            else if (msg.body.includes('entrada') || msg.body.includes('salario') 
                     || msg.body.includes('recebi') || msg.body.includes('salário') 
                     || msg.body.includes('ganhei')) {

                // Extract value and record money entry
                const value = msg.body.match(/\d+[\,\.]?\d{0,2}/)[0].replace(",", ".");
                const reports = await db.find('report', {"phone_number": {$eq: number}});
                var new_id = reports.length == 0 ? 1 : reports[reports.length-1].id + 1;
                await db.insert('report', {
                    "description": "Salário", 
                    "value": String(value), 
                    "method": "", 
                    "phone_number": String(number), 
                    "category": "", 
                    "id": Number(new_id), 
                    "date": new Date().getTime()
                });
                await f.delay(db.getRandomInt(MIN_TIME, MAX_TIME)); 
                await client.sendMessage(msg.from, messages.get_message_entry(String(value), new_id));
                await f.delay(db.getRandomInt(MIN_TIME, MAX_TIME)); 
                await client.sendMessage(msg.from, await messages.get_message_removal_description(new_id,variant));
            }

            // Report
            else if ((msg.body.includes('relatório') || msg.body.includes('relatorio') 
                      || msg.body.includes('saldo')  || msg.body.includes('fatura'))) {
                // Send report message
                let message = await messages.get_report_message(msg.body, number);
                await client.sendMessage(msg.from, message);
            }

            // Ask for Chatbot Opinion
            else if ((msg.body == "opinião cida")) {
                try {
                    let message = await messages.get_report_message("fatura", number);
                    var response = await db.get_request(messages.get_prompt_opinion(message));
                    const user = await db.find('users', {"phone_number": {$eq: number}});
                    await db.update('users', {"phone_number": {$eq: number}}, {$set: {"requests": user[0].requests + 1}});
                    await client.sendMessage(msg.from, response);
                } catch {
                    await f.delay(db.getRandomInt(MIN_TIME, MAX_TIME));
                    await client.sendMessage(msg.from, "Desculpe, não consegui realizar uma análise nesse momento, favor tentar novamente mais tarde");
                }
            }

            // Remove Expenses
            else if ((msg.body.match(/[Rr]emover.*\d+|[Ee]xcluir.*\d+/))) {
                // Remove specified report by ID
                var id = msg.body.match(/\d+/);
                if(await db.remove('report', {"id": {$eq: Number(id[0])}, "phone_number": {$eq: number}})) {
                    await client.sendMessage(msg.from, messages.get_message_removal(id));
                } else {
                    await client.sendMessage(msg.from, messages.get_message_removal_fail(id));
                }
            }
            else {
                // Admin options and media handling
                if (msg.body.match(/\?[aA][Dd][Dd]\?\+?.*\?[\w\s]*\?.*/) 
                    && await db.countDoc('admin',{"phone_number":{$eq: number}}) > 0) {
                    // Add user by admin
                    var splitted = msg.body.split('?');
                    var new_number = splitted[2].replace("+","");
                    new_number = await client.getNumberId(new_number);
                    new_number = new_number._serialized;
                    const newUser = await db.find('users', {"phone_number": {$eq: new_number}});
                    if(newUser.length > 0) {
                        if(newUser.due_date < new Date()) {
                            await db.update('users', {"phone_number": {$eq:new_number}}, {$set: {"due_date": new Date().setMonth(new Date().getMonth() + 1)}});
                        } else {
                            await db.update('users', {"phone_number": {$eq:new_number}}, {$set: {"due_date": new Date(newUser[0].due_date).setMonth(new Date(newUser[0].due_date).getMonth() + 1)}});
                        }
                    } else {
                        await db.insert('users', {
                            "phone_number": new_number,
                            "name": splitted[3],
                            "email": splitted[4],
                            "due_date": new Date().setMonth(new Date().getMonth() + 1)});
                    }
                    await client.sendMessage(new_number, messages.get_message_welcome(splitted[3],variant));
                    await f.delay(db.getRandomInt(MIN_TIME, MAX_TIME));
                    await client.sendMessage(new_number, messages.get_message_menu(splitted[3],variant));
                }
                // Remove user by admin
                else if (msg.body.match(/\?rem\?\d*@c\.us/) && await db.countDoc('admin', {"phone_number": {$eq: number}}) > 0) {
                    var splitted = msg.body.split('?');
                    await db.remove('users', {"phone_number": splitted[2]});
                    await client.sendMessage(msg.from, 'Usuário removido com sucesso!\nNúmero: ' + splitted[2]);
                }
                // Media handling for expense registration
                else if (msg.hasMedia) {
                    const mediafile = await msg.downloadMedia(); // Download media
                    const response = await db.get_request_media(messages.get_prompt_media(), mediafile.mimetype, mediafile.data);
                    const user = await db.find('users', {"phone_number": {$eq: number}});
                    await db.update('users', {"phone_number": {$eq: number}}, {$set: {"requests": user[0].requests + 1}});
                    const list = JSON.parse(response.match(/\[[\s\S]*\]/)[0]);
                    let first = true;
                    for (const result of list) {
                        const reports = await db.find('report', {"phone_number": {$eq: number}});
                        var new_id = reports.length == 0 ? 1 : reports[reports.length-1].id + 1;
                        let date = new Date();
                        if(result.parcela > 1) {
                            for(let i = 0; i < result.parcela; i++) {
                                await db.insert('report', {
                                    "description": String(result.descricao),
                                    "value": String(result.valor),
                                    "method": String(result.metodo), 
                                    "phone_number": String(number),
                                    "category": String(result.categoria), 
                                    "id": Number(new_id), 
                                    "date": date.getTime()
                                });
                                date = new Date(date.setMonth(date.getMonth() + 1));
                            }
                            result.valor = result.parcela + "x de " + result.valor;
                        } else {
                            await db.insert('report', {
                                "description": String(result.descricao),
                                "value": String(result.valor),
                                "method": String(result.metodo), 
                                "phone_number": String(number),
                                "category": String(result.categoria), 
                                "id": Number(new_id), 
                                "date": date.getTime()
                            });
                        }
                        if(first) {
                            first = false;
                            await client.sendMessage(msg.from, messages.get_message_payment(name,variant));
                        }
                        await f.delay(db.getRandomInt(MIN_TIME, MAX_TIME));
                        await client.sendMessage(msg.from, await messages.get_message_result(result, new_id));
                        await f.delay(db.getRandomInt(MIN_TIME, MAX_TIME)); 
                        await client.sendMessage(msg.from, await messages.get_message_removal_description(new_id,variant));
                    }
                }
                else {
                    // Default response for unhandled messages
                    var response = await db.get_request(messages.get_prompt_messagetype(msg.body)); //Get Message Type
                    const user = await db.find('users', {"phone_number": {$eq: number}});
                    await db.update('users', {"phone_number": {$eq:number}}, {$set: {"requests": user[0].requests + 1}});
                    response = response.toLowerCase().trim();

                    // Expense registration based on text
                    if(response == 'registro de gasto') {
                        try {
                            response = await db.get_request(messages.get_prompt_payment(msg.body));
                            const user = await db.find('users', {"phone_number": {$eq: number}});
                            await db.update('users', {"phone_number": {$eq: number}}, {$set: {"requests": user[0].requests + 1}});
                            const result = JSON.parse(response.match(/\{[\s\S]*\}/)[0]);
                            //console.log(result);
                            const reports = await db.find('report', {"phone_number": {$eq: number}});
                            var new_id = reports.length == 0 ? 1 : reports[reports.length-1].id + 1;
                            let date = new Date();
                            if(result.parcela > 1) {
                                for(let i = 0; i < result.parcela; i++) {
                                    await db.insert('report', {
                                        "description": String(await db.capitalizeFirstLetter(String(result.descricao))),
                                        "value": String(result.valor),
                                        "method": String(result.metodo), 
                                        "phone_number": String(number),
                                        "category": String(result.categoria), 
                                        "id": Number(new_id), 
                                        "date": date.getTime()
                                    });
                                    date = new Date(date.setMonth(date.getMonth() + 1));
                                }
                                result.valor = result.parcela + "x de " + result.valor;
                                await client.sendMessage(msg.from, messages.get_message_payment(name,variant));   
                            } else {
                                await db.insert('report', {
                                    "description": String(await db.capitalizeFirstLetter(String(result.descricao))),
                                    "value": String(result.valor),
                                    "method": String(result.metodo), 
                                    "phone_number": String(number),
                                    "category": String(result.categoria), 
                                    "id": Number(new_id), 
                                    "date": new Date().getTime()
                                });
                                await client.sendMessage(msg.from, messages.get_message_payment(name,variant));
                            }
                            await f.delay(db.getRandomInt(MIN_TIME, MAX_TIME)); 
                            await client.sendMessage(msg.from, await messages.get_message_result(result, new_id));
                            await f.delay(db.getRandomInt(MIN_TIME, MAX_TIME)); 
                            await client.sendMessage(msg.from, await messages.get_message_removal_description(new_id,variant));
                        } catch (e) {
                            console.log('Erro:', e);
                            console.log('Mensagem:', msg.body);
                            await client.sendMessage(msg.from, messages.get_message_failed_payment(variant));
                            await f.delay(db.getRandomInt(MIN_TIME, MAX_TIME));
                            await client.sendMessage(msg.from, messages.get_message_reminder_failed_payment(variant));
                        }
                    }
                    // Subscription registration
                    else if(response == 'registro de assinatura') {
                        const response = await db.get_request(messages.get_prompt_signature(msg.body));
                        const user = await db.find('users', {"phone_number": {$eq: number}});
                        await db.update('users', {"phone_number": {$eq: number}}, {$set: {"requests": user[0].requests + 1}});
                        if (response == msg.body) {
                            console.log("erro de assinatura");
                            await client.sendMessage(msg.from, messages.get_message_failed_payment(variant));
                        }
                        const result = JSON.parse(response.match(/\{[\s\S]*\}/)[0]);
                        const reports = await db.find('report', {"phone_number": {$eq: number}});
                        var new_id = reports.length == 0 ? 1 : reports[reports.length-1].id + 1;
                        await db.insert('report', {
                            "description": String(await db.capitalizeFirstLetter(String(result.descricao))),
                            "value": String(result.valor),
                            "method": "Assinatura", 
                            "phone_number": String(number),
                            "category": "Assinatura", 
                            "id": Number(new_id), 
                            "date": new Date().getTime()
                        });
                        await f.delay(db.getRandomInt(MIN_TIME, MAX_TIME));
                        await client.sendMessage(msg.from, messages.get_message_signature(String(await db.capitalizeFirstLetter(String(result.descricao))), String(result.valor), new_id));
                        await f.delay(db.getRandomInt(MIN_TIME, MAX_TIME)); 
                        await client.sendMessage(msg.from, await messages.get_message_removal_description(new_id,variant));
                    }
                    // Reminder handling
                    else if (response == 'lembrete') {
                        var response = await db.get_request(messages.get_prompt_reminder(msg.body));
                        const user = await db.find('users', {"phone_number": {$eq: number}});
                        await db.update('users', {"phone_number": {$eq: number}}, {$set: {"requests": user[0].requests + 1}});
                        await client.sendMessage(msg.from, messages.get_reminder_confirmation(name));
                        response = JSON.parse(response.match(/\{[\s\S]*\}/)[0]);
                        let hour = response.hora.split(":")[0];
                        let min = response.hora.split(":")[1];
                        var reminder_date = new Date(new Date(response.data).setUTCHours(hour, min, 0, 1)) - new Date().setHours(new Date().getHours() - 3);
                        if(reminder_date > 3600000) { // If reminder date is more than 1 hour in future
                            await new Promise(resolve => setTimeout(resolve, 3600000));
                            await client.sendMessage(msg.from, await messages.get_reminder_message(name, response.descricao, response.hora));
                        }
                        reminder_date = new Date(response.data).setHours(hour,min) - new Date();
                        if(reminder_date > 0) { // If reminder date is in the future
                            await new Promise(resolve => setTimeout(resolve, reminder_date));
                            await client.sendMessage(msg.from, await messages.get_reminder_message(name, response.descricao, response.hora));
                        }
                    }
                    // Unrecognized message
                    else {
                        console.log("nao identificada");
                        await client.sendMessage(msg.from, messages.get_message_failed_payment(variant));
                    }
                }

                await f.delay(db.getRandomInt(MIN_TIME, MAX_TIME));
                await chat.sendStateTyping();
                await f.delay(db.getRandomInt(MIN_TIME, MAX_TIME));
            }
        });
    } catch (e) {
        // Handle errors in message processing
        const chat = await msg.getChat();
        const contact = await msg.getContact();
        const number = contact.id._serialized;
        const name = contact.pushname;

        await f.delay(db.getRandomInt(MIN_TIME, MAX_TIME)); 
        await chat.sendStateTyping(); 
        await f.delay(db.getRandomInt(MIN_TIME, MAX_TIME));
        console.log('Erro:', e);
        console.log('Mensagem:', msg.body);
        await client.sendMessage(msg.from, messages.get_message_failed_payment(variant));

        await f.delay(db.getRandomInt(MIN_TIME, MAX_TIME));
        await chat.sendStateTyping();
        await f.delay(db.getRandomInt(MIN_TIME, MAX_TIME));
    }
});

// Function to add a new user
export async function addNewUser(number, name, email,time,stripe_customer) {
    number = number.replace("+", "");
    number = await client.getNumberId(number);
    number = number._serialized;
    const new_user = await db.find('users', {"phone_number": {$eq: number}});
    if(new_user.length > 0) {
        const updatedDate = new_user.due_date < new Date() ? new Date().setMonth(new Date().getMonth() + time) : new Date(new_user[0].due_date).setMonth(new Date(new_user[0].due_date).getMonth() + time);
        await db.update('users', {"phone_number": {$eq: number}}, {$set: {"due_date": updatedDate}});
    } else {
        await db.insert('users', {
            "phone_number": number,
            "name": name,
            "email": email,
            "due_date": new Date().setMonth(new Date().getMonth() + time),
            "stripe_customer": stripe_customer
        });
    }
    await client.sendMessage(number, messages.get_message_welcome(name,variant));
    await f.delay(db.getRandomInt(MIN_TIME, MAX_TIME));
    await client.sendMessage(number, messages.get_message_menu(name,variant));
}

export async function refund_user(name,email,stripe_customer,time){
    const updatedDate = new Date().setMonth(new Date().getMonth() - time)
    const user = await db.find('users', {"stripe_customer": {$eq: stripe_customer},"name":{$eq: name}, "email":{$eq: email}});
    if(user.length > 0) {
        await db.update('users',{"stripe_customer": {$eq: stripe_customer},"name":{$eq: name}, "email":{$eq: email}},{$set: {"due_date": updatedDate}})
    } else{
        console.log('Could not find user with ',name,email,stripe_customer)
    }
}