import { initialize,insert,find,remove,countDoc,getRandomInt, get_request,get_request_media, update, capitalizeFirstLetter} from './database.mjs';
import * as messages from './messages.js'
import qrcode from 'qrcode-terminal';
import {Client}  from 'whatsapp-web.js';


const client = new Client();

// serviço de leitura do qr code
client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    initialize();
    console.log('Tudo certo! WhatsApp conectado.');
    sendToWhatsApp();
});


client.initialize();
const delay = ms => new Promise(res => setTimeout(res, ms));

client.on('message', async msg => {

try {
    const contact = await msg.getContact();
    const number = contact.id._serialized;
    const name = contact.pushname;
    console.log(number,msg.from, msg.body)
    const user = await find('users',{"phone_number":{$eq:number}});
    msg.body = msg.body.toLowerCase().trim();

    const chat = await msg.getChat();
    await delay(getRandomInt(3000,4000)); 
    await chat.sendStateTyping(); 
    await delay(getRandomInt(3000,4000));


    //USUÁRIO NÃO CADASTRADO
    if (user.length == 0) {

        await client.sendMessage(msg.from,  messages.get_message_unregistered(name));

    }




    //MENU
    else if (msg.body == '3' || msg.body == 'menu') {

        await client.sendMessage(msg.from, messages.get_message_menu(name));


    }




    //VENCIMENTO
    else if (msg.body == 'vencimento' || msg.body == '4') {

        var date = new Date(user[0].due_date);
        
        await client.sendMessage(msg.from, messages.get_message_duedate(name,date));

    }




    //ENTRADA DE DINHEIRO
    else if (msg.body.includes('entrada') || msg.body.includes('salario') || msg.body.includes('recebi') || msg.body.includes('salário') || msg.body.includes('pagamento')) {

            const value = msg.body.match(/\d+[\,\.]?\d{0,2}/)[0].replace(",", ".");
            const reports = await find('report',{"phone_number":{$eq:number}});
            var new_id;
            if(reports.length == 0){
                var new_id = 1;
            } else{
                new_id = reports[reports.length-1].id + 1;
            }
            await insert('report',{"description":"Salário","value":String(value),"method":"", "phone_number":String(number),"category":"", "id": Number(new_id), "date": new Date().getTime()});
            await client.sendMessage(msg.from, messages.get_message_entry(String(value),new_id));

    }




    //RELATÓRIO
    else if ((msg.body.includes('relatório') || msg.body == '1' || msg.body.includes('relatorio') || msg.body.includes('saldo') || msg.body.includes('fatura'))) {
    
        let message = await messages.get_report_message(msg.body, number);

        await client.sendMessage(msg.from,message);

    }




    //REMOVER GASTO
    else if ((msg.body.match(/[Rr]emover.*\d+/))) {

        var id = msg.body.match(/\d+/);
        if(await remove('report',{"id":{$eq:Number(id[0])},"phone_number":{$eq:number}})){
            await client.sendMessage(msg.from, messages.get_message_removal(id));
        } else {
            await client.sendMessage(msg.from, messages.get_message_removal_fail(id));
        }

    }


    else {



        //ADMINISTRADOR ADICIONAR USUÁRIO
        if(msg.body.match(/\?[aA][Dd][Dd]\?\+?.*\?[\w\s]*\?.*/) && await countDoc('admin',{"phone_number":{$eq:number}}) > 0){
            var splitted = msg.body.split('?');
            var new_number = splitted[2].replace("+","");
            new_number = await client.getNumberId(new_number);
            new_number = new_number._serialized;
            const new_user = await find('users',{"phone_number":{$eq:new_number}})
            if(new_user.length > 0){
                if(new_user.due_date < new Date()){
                    await update('users',{"phone_number":new_number},{$set:{"due_date":new Date().setMonth(new Date().getMonth() + 1)}});
                } else {
                    await update('users',{"phone_number":new_number},{$set:{"due_date":new Date(new_user[0].due_date).setMonth(new Date(new_user[0].due_date).getMonth() + 1)}});
                }
                
            } else{
                await insert('users',{"phone_number":new_number,"name":splitted[3],"email":splitted[4],"due_date": new Date().setMonth(new Date().getMonth() + 1)});
            }
            await client.sendMessage(new_number, messages.get_message_welcome(splitted[3]));

        }
        
        

        //ADMINISTRADOR REMOVER USUÁRIO
        else if (msg.body.match(/\?rem\?\d*@c\.us/) && await countDoc('admin',{"phone_number":{$eq:number}}) > 0){
            var splitted = msg.body.split('?');
            await remove('users',{"phone_number":splitted[2]})
            await client.sendMessage(msg.from, 'Usuário removido com sucesso!\n\
Número: ' + splitted[2]);

        }
          
    
    
        // ADICIONAR GASTO POR MIDIA
        else if(msg.hasMedia){
            const mediafile = await msg.downloadMedia()
            const response = await get_request_media(messages.get_prompt_media(),mediafile.mimetype,mediafile.data)
            const result = JSON.parse(response.match(/{[\s\S]*\}/)[0]);
            const reports = await find('report',{"phone_number":{$eq:number}});
            var new_id;
            if(reports.length == 0){
                var new_id = 1;
            } else{
                new_id = reports[reports.length-1].id + 1;
            }
            let date = new Date();
            if(result.parcela > 1){
                for(let i = 0; i < result.parcela; i++){
                    await insert('report',{"description":String(result.descricao),"value":String(result.valor),"method":String(result.metodo), "phone_number":String(number),"category":String(result.categoria), "id": Number(new_id), "date": date.getTime()});
                    date = new Date(date.setMonth(date.getMonth() + 1));
                }
                result.valor = result.parcela + "x de " + result.valor
                await client.sendMessage(msg.from, messages.get_message_payment(result,new_id, name));   
            } else {
                await insert('report',{"description":String(result.descricao),"value":String(result.valor),"method":String(result.metodo), "phone_number":String(number),"category":String(result.categoria), "id": Number(new_id), "date": date.getTime()});
                await client.sendMessage(msg.from, messages.get_message_payment(result,new_id, name));
            }
        }



        //CASO NÃO RECONHEÇA A MENSAGEM, VERIFICAR COM A IA
        else {
            var response = await get_request(messages.get_prompt_messagetype(msg.body));
            response = response.toLowerCase().trim();
            //console.log('Classificação IA:',response);

            // ADICIONAR GASTO POR TEXTO
            if(response == 'registro de gasto'){

                response = await get_request(messages.get_prompt_payment(msg.body));
                try{
                    const result = JSON.parse(response.match(/{[\s\S]*\}/)[0]);
                    const reports = await find('report',{"phone_number":{$eq:number}});
                    var new_id;
                    if(reports.length == 0){
                        var new_id = 1;
                    } else{
                        new_id = reports[reports.length-1].id + 1;
                    }
                    let date = new Date();
                    if(result.parcela > 1){
                        for(let i = 0; i < result.parcela; i++){
                            await insert('report',{"description":String(await capitalizeFirstLetter(String(result.descricao))),"value":String(result.valor),"method":String(result.metodo), "phone_number":String(number),"category":String(result.categoria), "id": Number(new_id), "date": date.getTime()})
                            date = new Date(date.setMonth(date.getMonth() + 1));
                        }
                        result.valor = result.parcela + "x de " + result.valor
                        await client.sendMessage(msg.from, messages.get_message_payment(result,new_id, name));   
                    } else {
                        await insert('report',{"description":String(await capitalizeFirstLetter(String(result.descricao))),"value":String(result.valor),"method":String(result.metodo), "phone_number":String(number),"category":String(result.categoria), "id": Number(new_id), "date": new Date().getTime()});
                        await client.sendMessage(msg.from, messages.get_message_payment(result,new_id, name));
                    }
                } catch(e){
                    await client.sendMessage(msg.from, messages.get_message_failed_payment(name));
                }
            }

            //ADICIONAR ASSINATURAS
            else if(response == 'registro de assinatura'){
                const response = await get_request(messages.get_prompt_signature(msg.body));
                if (response == msg.body){
                    await client.sendMessage(msg.from, messages.get_message_help(name));
                }
                const result = JSON.parse(response.match(/{[\s\S]*\}/)[0]);
                const reports = await find('report',{"phone_number":{$eq:number}});
                var new_id;
                if(reports.length == 0){
                    var new_id = 1;
                } else{
                    new_id = reports[reports.length-1].id + 1;
                }
                await insert('report',{"description":String(await capitalizeFirstLetter(String(result.descricao))),"value":String(result.valor),"method":"Assinatura", "phone_number":String(number),"category":"Assinatura", "id": Number(new_id), "date": new Date().getTime()});
                
                await client.sendMessage(msg.from, messages.get_message_signature(String(await capitalizeFirstLetter(String(result.descricao))),String(result.valor),new_id));




            } 
            
            
            
            //ADICIONAR LEMBRETES
            else if (response == 'lembrete'){
                var response = await get_request(messages.get_prompt_reminder(msg.body));
                await client.sendMessage(msg.from, messages.get_reminder_confirmation(name));
                response = JSON.parse(response.match(/{[\s\S]*\}/)[0]);
                let hour = response.hora.split(":")[0];
                let min = response.hora.split(":")[1];
                console.log(new Date(new Date(response.data).setUTCHours(hour,min,0,1)),new Date().setHours(new Date().getHours() - 3));
                var reminder_date = new Date(new Date(response.data).setUTCHours(hour,min,0,1)) - new Date().setHours(new Date().getHours() - 3);
                console.log('reminder_date',reminder_date);
                /*if (reminder_date > 86400000){ //bigger than 24 hours
                    await new Promise(resolve => setTimeout(resolve, 86400000));
                    await client.sendMessage(msg.from, await messages.get_reminder_message(name, response.descricao, response.hora));

                }*/
               
                var reminder_date = new Date(response.data).setHours(hour,min) - new Date();
                if(reminder_date > 3600000){ //bigger than 1 hour
                    console.log('Aguardar 1 hora para lembrete');
                    await new Promise(resolve => setTimeout(resolve, 3600000));
                    await client.sendMessage(msg.from, await messages.get_reminder_message(name, response.descricao, response.hora));
                }
                var reminder_date = new Date(response.data).setHours(hour,min) - new Date();
                if(reminder_date > 0){ //future date
                    await new Promise(resolve => setTimeout(resolve, reminder_date));
                    await client.sendMessage(msg.from, await messages.get_reminder_message(name, response.descricao, response.hora));

                }
            }


            //MENSAGEM NAO IDENTIFICADA
            else {
                await client.sendMessage(msg.from, messages.get_message_help(name));
            }
        }

    await delay(getRandomInt(2000,5000));
    await chat.sendStateTyping();
    await delay(getRandomInt(2000,5000));
    }

}
    catch(e){

        const chat = await msg.getChat();
        const contact = await msg.getContact();
        const number = contact.id._serialized;
        const name = contact.pushname;

        await delay(getRandomInt(3000,4000)); 
        await chat.sendStateTyping(); 
        await delay(getRandomInt(3000,4000));
        console.log('Erro:', e);
        console.log('Mensagem:', msg.body)
        await client.sendMessage(msg.from, messages.get_message_help(name));

        await delay(getRandomInt(2000,5000));
        await chat.sendStateTyping();
        await delay(getRandomInt(2000,5000));

    }
});

async function sendToWhatsApp() {
    console.log('Sending messages to WhatsApp...');
    
    var time = remainingTime();
    if(time > 863000000){
        await new Promise(resolve => setTimeout(resolve, 862000000));
    }
    time = remainingTime();
    await new Promise(resolve => setTimeout(resolve, time));
    //const users = await find('users',{"phone_number":{$ne:"12138927437@c.us"}}); // Exclude Zapier number
    const users = await find('users',{"phone_number":{$eq:"556798553495@c.us"}});
    for (let i = 0; i < users.length; i++) {
        var user = users[i];
        let new_number = user.phone_number.replace("@c.us","");
        new_number = await client.getNumberId(new_number);
        new_number = new_number._serialized;
        console.log('await sendMessage to ',new_number);
        await client.sendMessage(new_number, await messages.get_report_message("1",new_number));
    }
    sendToWhatsApp();

}

function remainingTime() {
    const current = new Date();
    var next = new Date(new Date().setMonth(current.getMonth() + 1));
    next = new Date(next.getFullYear(), next.getMonth(), 1)
    //return 1000
    return next - current;
}

export async function export_excel(){
    const XLSX = require("xlsx");

    // Open existing Excel file
    const workbook = XLSX.readFile("Planilha Cida.xlsx");
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    // ✅ Modify if needed
    worksheet["B2"] = { t: "n", v: 100 };

    // Save as a new file
    XLSX.writeFile(workbook, "output.xlsx");
}