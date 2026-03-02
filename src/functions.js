import * as db from './database.mjs'
import * as messages from './messages.js'

const DDD_JSON = {
  "11": 3,
  "12": 3,
  "13": 3,
  "14": 3,
  "15": 3,
  "16": 3,
  "17": 3,
  "18": 3,
  "19": 3,
  "21": 3,
  "22": 3,
  "24": 3,
  "27": 3,
  "28": 3,
  "31": 3,
  "32": 3,
  "33": 3,
  "34": 3,
  "35": 3,
  "37": 3,
  "38": 3,
  "41": 3,
  "42": 3,
  "43": 3,
  "44": 3,
  "45": 3,
  "46": 3,
  "47": 3,
  "48": 3,
  "49": 3,
  "51": 3,
  "53": 3,
  "54": 3,
  "55": 3,
  "61": 3,
  "62": 3,
  "64": 3,
  "63": 3,
  "65": 4,
  "66": 4,
  "67": 4,
  "68": 5,
  "69": 4,
  "71": 3,
  "73": 3,
  "74": 3,
  "75": 3,
  "77": 3,
  "79": 3,
  "81": 3,
  "82": 3,
  "83": 3,
  "84": 3,
  "85": 3,
  "86": 3,
  "87": 3,
  "88": 3,
  "89": 3,
  "91": 3,
  "93": 4,
  "94": 4,
  "95": 4,
  "96": 3,
  "97": 4,
  "98": 3,
  "99": 3
}

export function get_reminder_date (response,ddd){
  const hour = response.hora.split(":")[0];
  const min = response.hora.split(":")[1];
  return new Date(new Date(response.data).setUTCHours(hour, min, 0, 1)) - new Date().setHours(new Date().getHours() - DDD_JSON[ddd]);
}


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

export async function sendToWhatsApp(client,variant) {
    console.log('Sending messages to WhatsApp...');
    
    var time = remainingTime();
    /*if(time > 863000000){
        await new Promise(resolve => setTimeout(resolve, 862000000));
    }*/
   while (time > 43200000){
      console.log ("Awaiting ", time)
      await new Promise (resolve => setTimeout(resolve, 40000000))
      time = remainingTime();
   }
    await new Promise(resolve => setTimeout(resolve, time));
    //const users = await db.find('users',{"phone_number":{$ne:"12138927437@c.us"},"variant": {$eq:variant}}); // Exclude Zapier number
    const users = await db.find('users',{"phone_number":{$eq:"556798553495@c.us"}});
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