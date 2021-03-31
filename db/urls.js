require('dotenv').config();

const mongodb=require('mongodb');
const objectId=mongodb.ObjectId;
const mongoClient=mongodb.MongoClient;
const db_url=process.env.DB_URL;
const db_name=process.env.DB_NAME;
const url_collection="urls";

let addUrl=async(short,full,email,checkEmail,updateUrl)=>{
    try{
        const clientInfo=await mongoClient.connect(db_url);
        const db=await clientInfo.db(db_name);
        const data=await db.collection(url_collection).insertOne({
            short,full,hits:0
        });
        const id=data.ops[0]._id;
        const user=await checkEmail(email);
        const urls=[...user.urls];
        urls.push(id);
        await updateUrl(email,urls);
        clientInfo.close();
    }
    catch(err)
    {
        throw err;
    }
}
let getFullUrl=async(short)=>{
    try{
        const clientInfo=await mongoClient.connect(db_url);
        const db=await clientInfo.db(db_name);
        const data=await db.collection(url_collection).findOne({
            short:{$eq:short}
        });
        const hits=data.hits;
        await db.collection(url_collection).updateOne({
            short:{$eq:short}
        },{$set:{hits:hits+1}});
        clientInfo.close();
        return data.full;
        
    }
    catch(err)
    {
        throw err;
    }

}
let getById=async(id)=>{
    try{
        id=new objectId(id);
        const clientInfo=await mongoClient.connect(db_url);
        const db=await clientInfo.db(db_name);
        const data=await db.collection(url_collection).findOne({
            _id:{$eq:id}
        });
        clientInfo.close();
        data.short=process.env.SERVER_URL+data.short;
        return data;
    }
    catch(err)
    {
        throw err;
    }
}

module.exports={
    addUrl,getFullUrl,getById
}