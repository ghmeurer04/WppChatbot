import { MongoClient } from 'mongodb'
import { GoogleGenAI } from "@google/genai";

var client
var database
var session
const ai = new GoogleGenAI({ apiKey: "AIzaSyBtipJvjVwTkcF6KKdIwl5UC4b7Xr3DRFQ" });

export function initialize(){
    const uri = "mongodb://localhost:27017/";
    client = new MongoClient(uri);
    client.connect();
    session = client.startSession();
}

export async function insert(dbName,json){
    try{
        database = await client.db('wpp');
        var collection = await database.collection(dbName);
        await collection.insertOne(json);
        return true;
    }
    catch{
        return false;
    }
}
export async function find(dbName,query){
        database = await client.db('wpp');
        var collection = await database.collection(dbName);
        const documents = await collection.find(query).toArray();
        //console.log(documents);
        return documents;
}

export async function countDoc(dbName,query){
        database = await client.db('wpp');
        var collection = await database.collection(dbName);
        const documents = await collection.countDocuments(query);
        return documents;
}

export async function update(dbName,query,update){
        database = await client.db('wpp');
        var collection = await database.collection(dbName);
        const documents = await collection.updateOne(query,update);
        return documents.modifiedCount;
}


export async function remove(dbName,query){
    try{
        database = await client.db('wpp');
        var collection = await database.collection(dbName);
        var deleted = await collection.deleteMany(query);
        if(deleted.deletedCount > 0){
            return true;
        }
        return false;
    }
    catch{
        return false;
    }
}

export function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

export async function get_request(prompt) {
    console.log(prompt);
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-lite",
        contents: prompt,
    });
    return response.text;
  
}

export async function get_request_media(prompt,mediaType,data){
    const contents = [
        { text: prompt },
        { inlineData: { mimeType: mediaType, data: data } },
    ];
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-lite",
        contents: contents,
    });
  return response.text;
}

export async function capitalizeFirstLetter(val) {
    //console.log(val,String(val).charAt(0).toUpperCase() + String(val).slice(1));
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}
