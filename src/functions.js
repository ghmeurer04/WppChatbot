import * as db from './database.mjs'
import * as messages from './messages.js'


function remainingTime() {
    const current = new Date();
    var next = new Date(new Date().setMonth(current.getMonth() + 1));
    next = new Date(next.getFullYear(), next.getMonth(), 1)
    //return 1000
    return next - current;
}

export const delay = ms => new Promise(res => setTimeout(res, ms));

export async function export_excel(){
    const XLSX = require("xlsx");

    const workbook = XLSX.readFile("Planilha Cida.xlsx");
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    worksheet["B2"] = { t: "n", v: 100 };

    XLSX.writeFile(workbook, "output.xlsx");
}

export async function sendToWhatsApp(client) {
    console.log('Sending messages to WhatsApp...');
    
    var time = remainingTime();
    if(time > 863000000){
        await new Promise(resolve => setTimeout(resolve, 862000000));
    }
    time = remainingTime();
    await new Promise(resolve => setTimeout(resolve, time));
    const users = await db.find('users',{"phone_number":{$ne:"12138927437@c.us"}}); // Exclude Zapier number
    //const users = await db.find('users',{"phone_number":{$eq:"556798553495@c.us"}});
    for (let i = 0; i < users.length; i++) {
        var user = users[i];
        let new_number = user.phone_number.replace("@c.us","");
        new_number = await client.getNumberId(new_number);
        new_number = new_number._serialized;
        console.log('await sendMessage to ',new_number);
        await client.sendMessage(new_number, await messages.get_report_message("fatura",new_number,true));
        await db.update('users',{"phone_number":{$eq:new_number}},{$set:{"requests":0}});
        await delay(db.getRandomInt(60000,90000));
    }
    sendToWhatsApp(client);
}

export async function retry(fn, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
        await delay(db.getRandomInt(3000,5000));
        if (attempt === retries) throw err;
    }
  }
}