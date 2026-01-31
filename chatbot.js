import * as db from './database.mjs'
import * as messages from './messages.js'
import qrcode from 'qrcode-terminal';
import * as localAuth from './LocalAuth.cjs'
import * as f from './functions.js'


let MIN_TIME = 4000;
let MAX_TIME = 6000;
let REQUEST_LIMIT = 300;


const client = localAuth.initialize_client()

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});
client.on('code', (code) => {
    console.log("Linking code:",code);
});

client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado.');
    db.initialize();
    f.sendToWhatsApp(client);
});

client.initialize();

client.on('message', async msg => {
try {
    
    const contact = await msg.getContact();
    const number = contact.id._serialized;
    const name = contact.pushname;
    console.log(number,msg.from, msg.body)
    const user = await db.find('users',{"phone_number":{$eq:number}});
    msg.body = msg.body.toLowerCase().trim();

    const chat = await msg.getChat();
    await f.delay(db.getRandomInt(MIN_TIME,MAX_TIME)); 
    await chat.sendStateTyping(); 
    await f.delay(db.getRandomInt(MIN_TIME,MAX_TIME));

    await f.retry(async () => {
    //USUÁRIO NÃO CADASTRADO
    if (user.length == 0) {

        await client.sendMessage(msg.from,  messages.get_message_unregistered(name));

    }



    //LIMITE DE REQUISICOES ATINGIDO

    else if(user[0].requests > REQUEST_LIMIT + 10){
    
    
    }
    else if(user[0].requests > REQUEST_LIMIT){
        await client.sendMessage(msg.from, messages.get_message_limit(name))
        await db.update('users',{"phone_number":{$eq:number}},{$set:{"requests":REQUEST_LIMIT+1}});
        
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
    else if (msg.body.includes('entrada') || msg.body.includes('salario') || msg.body.includes('recebi') || msg.body.includes('salário') || msg.body.includes('ganhei')) {

            const value = msg.body.match(/\d+[\,\.]?\d{0,2}/)[0].replace(",", ".");
            const reports = await db.find('report',{"phone_number":{$eq:number}});
            var new_id;
            if(reports.length == 0){
                var new_id = 1;
            } else{
                new_id = reports[reports.length-1].id + 1;
            }
            await db.insert('report',{"description":"Salário","value":String(value),"method":"", "phone_number":String(number),"category":"", "id": Number(new_id), "date": new Date().getTime()});
            await f.delay(db.getRandomInt(MIN_TIME,MAX_TIME)); 
            await client.sendMessage(msg.from, messages.get_message_entry(String(value),new_id));
            await f.delay(db.getRandomInt(MIN_TIME,MAX_TIME)); 
            await client.sendMessage(msg.from, await messages.get_message_removal_description(new_id));

    }




    //RELATÓRIO
    else if ((msg.body.includes('relatório') || msg.body == '1' || msg.body.includes('relatorio') || msg.body.includes('saldo') || msg.body.includes('fatura'))) {
    
        let message = await messages.get_report_message(msg.body, number);

        await client.sendMessage(msg.from,message);

    }

    else if ((msg.body == "opinião cida")) {
        try{
            let message = await messages.get_report_message("fatura", number);
            var response = await db.get_request(messages.get_prompt_opinion(message));
            const user = await db.find('users',{"phone_number":{$eq:number}});
            if(user[0].requests){
                await db.update('users',{"phone_number":{$eq:number}},{$set:{"requests":user[0].requests + 1}});
            } else {
                await db.update('users',{"phone_number":{$eq:number}},{$set:{"requests":1}});
            }
            await client.sendMessage(msg.from,response);
        } catch {
            await f.delay(db.getRandomInt(MIN_TIME,MAX_TIME));
            await client.sendMessage(msg.from,"Desculpe, não consegui realizar uma análise nesse momento, favor tentar novamente mais tarde");
        }

    }




    //REMOVER GASTO
    else if ((msg.body.match(/[Rr]emover.*\d+\|[Ee]xcluir.*\d+/))) {

        var id = msg.body.match(/\d+/);
        if(await db.remove('report',{"id":{$eq:Number(id[0])},"phone_number":{$eq:number}})){
            await client.sendMessage(msg.from, messages.get_message_removal(id));
        } else {
            await client.sendMessage(msg.from, messages.get_message_removal_fail(id));
        }

    }


    else {



        //ADMINISTRADOR ADICIONAR USUÁRIO
        if(msg.body.match(/\?[aA][Dd][Dd]\?\+?.*\?[\w\s]*\?.*/) && await db.countDoc('admin',{"phone_number":{$eq:number}}) > 0){
            var splitted = msg.body.split('?');
            var new_number = splitted[2].replace("+","");
            new_number = await client.getNumberId(new_number);
            new_number = new_number._serialized;
            const new_user = await db.find('users',{"phone_number":{$eq:new_number}})
            if(new_user.length > 0){
                if(new_user.due_date < new Date()){
                    await db.update('users',{"phone_number":{$eq:new_number}},{$set:{"due_date":new Date().setMonth(new Date().getMonth() + 1)}});
                } else {
                    await db.update('users',{"phone_number":{$eq:new_number}},{$set:{"due_date":new Date(new_user[0].due_date).setMonth(new Date(new_user[0].due_date).getMonth() + 1)}});
                }
                
            } else{
                await db.insert('users',{"phone_number":new_number,"name":splitted[3],"email":splitted[4],"due_date": new Date().setMonth(new Date().getMonth() + 1)});
            }
            await client.sendMessage(new_number, messages.get_message_welcome(splitted[3]));
            await f.delay(db.getRandomInt(MIN_TIME,MAX_TIME));
            await client.sendMessage(new_number, messages.get_message_menu(splitted[3]));

        }
        
        

        //ADMINISTRADOR REMOVER USUÁRIO
        else if (msg.body.match(/\?rem\?\d*@c\.us/) && await db.countDoc('admin',{"phone_number":{$eq:number}}) > 0){
            var splitted = msg.body.split('?');
            await db.remove('users',{"phone_number":splitted[2]})
            await client.sendMessage(msg.from, 'Usuário removido com sucesso!\n\
Número: ' + splitted[2]);

        }
          
    
    
        // ADICIONAR GASTO POR MIDIA
        else if(msg.hasMedia){
            const mediafile = await msg.downloadMedia()
            const response = await db.get_request_media(messages.get_prompt_media(),mediafile.mimetype,mediafile.data)
            const user = await db.find('users',{"phone_number":{$eq:number}});
            if(user[0].requests){
                await db.update('users',{"phone_number":{$eq:number}},{$set:{"requests":user[0].requests + 1}});
            } else {
                await db.update('users',{"phone_number":{$eq:number}},{$set:{"requests":1}});
            }
            const list = JSON.parse(response.match(/\[[\s\S]*\]/)[0]);
            let first = true;
            for (const result of list) {
            const reports = await db.find('report',{"phone_number":{$eq:number}});
            var new_id;
            if(reports.length == 0){
                var new_id = 1;
            } else{
                new_id = reports[reports.length-1].id + 1;
            }
            let date = new Date();
            if(result.parcela > 1){
                for(let i = 0; i < result.parcela; i++){
                    await db.insert('report',{"description":String(result.descricao),"value":String(result.valor),"method":String(result.metodo), "phone_number":String(number),"category":String(result.categoria), "id": Number(new_id), "date": date.getTime()});
                    date = new Date(date.setMonth(date.getMonth() + 1));
                }
                result.valor = result.parcela + "x de " + result.valor  
            } else {
                await db.insert('report',{"description":String(result.descricao),"value":String(result.valor),"method":String(result.metodo), "phone_number":String(number),"category":String(result.categoria), "id": Number(new_id), "date": date.getTime()});
            }
            if(first == true){
                first = false;
                await client.sendMessage(msg.from, messages.get_message_payment(name));
            }
            await f.delay(db.getRandomInt(MIN_TIME,MAX_TIME));
            await client.sendMessage(msg.from, await messages.get_message_result(result,new_id));
            await f.delay(db.getRandomInt(MIN_TIME,MAX_TIME)); 
            await client.sendMessage(msg.from, await messages.get_message_removal_description(new_id));
            }
        }


        else {
            var response = await db.get_request(messages.get_prompt_messagetype(msg.body));
            const user = await db.find('users',{"phone_number":{$eq:number}});
            if(user[0].requests){
                await db.update('users',{"phone_number":{$eq:number}},{$set:{"requests":user[0].requests + 1}});
            } else {
                await db.update('users',{"phone_number":{$eq:number}},{$set:{"requests":1}});
            }
            response = response.toLowerCase().trim();

            // ADICIONAR GASTO POR TEXTO
            if(response == 'registro de gasto'){

                try{
                    response = await db.get_request(messages.get_prompt_payment(msg.body));
                    const user = await db.find('users',{"phone_number":{$eq:number}});
                    if(user[0].requests){
                        await db.update('users',{"phone_number":{$eq:number}},{$set:{"requests":user[0].requests + 1}});
                    } else {
                        await db.update('users',{"phone_number":{$eq:number}},{$set:{"requests":1}});
                    }
                    const result = JSON.parse(response.match(/\{[\s\S]*\}/)[0]);
                    console.log(result)
                    const reports = await db.find('report',{"phone_number":{$eq:number}});
                    var new_id;
                    if(reports.length == 0){
                        var new_id = 1;
                    } else{
                        new_id = reports[reports.length-1].id + 1;
                    }
                    let date = new Date();
                    if(result.parcela > 1){
                        for(let i = 0; i < result.parcela; i++){
                            await db.insert('report',{"description":String(await db.capitalizeFirstLetter(String(result.descricao))),"value":String(result.valor),"method":String(result.metodo), "phone_number":String(number),"category":String(result.categoria), "id": Number(new_id), "date": date.getTime()})
                            date = new Date(date.setMonth(date.getMonth() + 1));
                        }
                        result.valor = result.parcela + "x de " + result.valor
                        await client.sendMessage(msg.from, messages.get_message_payment(name));   
                    } else {
                        await db.insert('report',{"description":String(await db.capitalizeFirstLetter(String(result.descricao))),"value":String(result.valor),"method":String(result.metodo), "phone_number":String(number),"category":String(result.categoria), "id": Number(new_id), "date": new Date().getTime()});
                        await client.sendMessage(msg.from, messages.get_message_payment(name));
                    }
                    await f.delay(db.getRandomInt(MIN_TIME,MAX_TIME)); 
                    await client.sendMessage(msg.from, await messages.get_message_result(result,new_id));
                    await f.delay(db.getRandomInt(MIN_TIME,MAX_TIME)); 
                    await client.sendMessage(msg.from, await messages.get_message_removal_description(new_id));

                } catch(e){
                    console.log('Erro:', e);
                    console.log('Mensagem:', msg.body)
                    await client.sendMessage(msg.from, messages.get_message_failed_payment(name));
                    await f.delay(db.getRandomInt(MIN_TIME,MAX_TIME));
                    await client.sendMessage(msg.from, messages.get_message_reminder_failed_payment())
                }
            }

            //ADICIONAR ASSINATURAS
            else if(response == 'registro de assinatura'){
                const response = await db.get_request(messages.get_prompt_signature(msg.body));
                const user = await db.find('users',{"phone_number":{$eq:number}});
                if(user[0].requests){
                    await db.update('users',{"phone_number":{$eq:number}},{$set:{"requests":user[0].requests + 1}});
                } else {
                    await db.update('users',{"phone_number":{$eq:number}},{$set:{"requests":1}});
                }
                if (response == msg.body){
                    console.log("erro de assinatura")
                    await client.sendMessage(msg.from, messages.get_message_failed_payment(name));
                }
                const result = JSON.parse(response.match(/\{[\s\S]*\}/)[0]);
                const reports = await db.find('report',{"phone_number":{$eq:number}});
                var new_id;
                if(reports.length == 0){
                    var new_id = 1;
                } else{
                    new_id = reports[reports.length-1].id + 1;
                }
                await db.insert('report',{"description":String(await db.capitalizeFirstLetter(String(result.descricao))),"value":String(result.valor),"method":"Assinatura", "phone_number":String(number),"category":"Assinatura", "id": Number(new_id), "date": new Date().getTime()});
                
                await f.delay(db.getRandomInt(MIN_TIME,MAX_TIME));
                await client.sendMessage(msg.from, messages.get_message_signature(String(await db.capitalizeFirstLetter(String(result.descricao))),String(result.valor),new_id));
                await f.delay(db.getRandomInt(MIN_TIME,MAX_TIME)); 
                await client.sendMessage(msg.from, await messages.get_message_removal_description(new_id));


            } 
            
            
            
            //ADICIONAR LEMBRETES
            else if (response == 'lembrete'){
                var response = await db.get_request(messages.get_prompt_reminder(msg.body));
                const user = await db.find('users',{"phone_number":{$eq:number}});
                if(user[0].requests){
                    await db.update('users',{"phone_number":{$eq:number}},{$set:{"requests":user[0].requests + 1}});
                } else {
                    await db.update('users',{"phone_number":{$eq:number}},{$set:{"requests":1}});
                }
                await client.sendMessage(msg.from, messages.get_reminder_confirmation(name));
                response = JSON.parse(response.match(/\{[\s\S]*\}/)[0]);
                let hour = response.hora.split(":")[0];
                let min = response.hora.split(":")[1];
                //console.log(new Date(new Date(response.data).setUTCHours(hour,min,0,1)),new Date().setHours(new Date().getHours() - 3));
                var reminder_date = new Date(new Date(response.data).setUTCHours(hour,min,0,1)) - new Date().setHours(new Date().getHours() - 3);
                //console.log('reminder_date',reminder_date);
                /*if (reminder_date > 86400000){ //bigger than 24 hours
                    await new Promise(resolve => setTimeout(resolve, 86400000));
                    await client.sendMessage(msg.from, await messages.get_reminder_message(name, response.descricao, response.hora));

                }*/
               
                var reminder_date = new Date(response.data).setHours(hour,min) - new Date();
                if(reminder_date > 3600000){ //bigger than 1 hour
                    //console.log('Aguardar 1 hora para lembrete');
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
                console.log("nao identificada")
                await client.sendMessage(msg.from, messages.get_message_failed_payment(name));
            }
        }

    await f.delay(db.getRandomInt(MIN_TIME,MAX_TIME));
    await chat.sendStateTyping();
    await f.delay(db.getRandomInt(MIN_TIME,MAX_TIME));
    }
});
}

    catch(e){

        const chat = await msg.getChat();
        const contact = await msg.getContact();
        const number = contact.id._serialized;
        const name = contact.pushname;

        await f.delay(db.getRandomInt(MIN_TIME,MAX_TIME)); 
        await chat.sendStateTyping(); 
        await f.delay(db.getRandomInt(MIN_TIME,MAX_TIME));
        console.log('Erro:', e);
        console.log('Mensagem:', msg.body)
        await client.sendMessage(msg.from, messages.get_message_failed_payment(name));

        await f.delay(db.getRandomInt(MIN_TIME,MAX_TIME));
        await chat.sendStateTyping();
        await f.delay(db.getRandomInt(MIN_TIME,MAX_TIME));

    }
});

export async function addNewUser(number,name,email){
    number = number.replace("+","");
    number = await client.getNumberId(number);
    number = number._serialized;
    const new_user = await db.find('users',{"phone_number":{$eq:number}})
            if(new_user.length > 0){
                if(new_user.due_date < new Date()){
                    await db.update('users',{"phone_number":{$eq:number}},{$set:{"due_date":new Date().setMonth(new Date().getMonth() + 1)}});
                } else {
                    await db.update('users',{"phone_number":{$eq:number}},{$set:{"due_date":new Date(new_user[0].due_date).setMonth(new Date(new_user[0].due_date).getMonth() + 1)}});
                }
                
            } else{
                await db.insert('users',{"phone_number":number,"name":name,"email":email,"due_date": new Date().setMonth(new Date().getMonth() + 1)});
            }
            await client.sendMessage(number, messages.get_message_welcome(name));
            await f.delay(db.getRandomInt(MIN_TIME,MAX_TIME));
            await client.sendMessage(number, messages.get_message_menu(name));
}