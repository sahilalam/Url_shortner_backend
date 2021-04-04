require('dotenv').config();

const mongodb=require('mongodb');

const mongoClient=mongodb.MongoClient;
const db_url=process.env.DB_URL;
const db_name=process.env.DB_NAME;
const url_collection="urls";
const objectId=mongodb.ObjectId;

let addUrl=async(short,full,email,checkEmail,updateUrl)=>{
    try{
        const clientInfo=await mongoClient.connect(db_url);
        const db=await clientInfo.db(db_name);
        const data=await db.collection(url_collection).insertOne({
            short:process.env.SERVER_URL+short
            ,full,hits:0
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
let getByIds=async(urls)=>{
    try{
        
        const clientInfo=await mongoClient.connect(db_url);
        const db=await clientInfo.db(db_name);
        const data=await db.collection(url_collection).find({
            _id:{$in:urls}
        }).toArray();
        clientInfo.close();
        return data;
    }
    catch(err)
    {
        throw err;
    }
}
let getAllUrl=async(urls,offset)=>{
    try{
         let data=[];
         for(let i=offset;i<(offset+5) && i<urls.length;i++)
         {
             console.log(i)
             let id=new objectId(urls[i]);
             data.push(id);
         }
         let result=await getByIds(data);
         return {
             result,
             next:(offset+5<urls.length)?true:false,
             prev:(offset-5>=0)?true:false
         };
    }
    catch(err)
    {
        throw err;
    }
 }
module.exports={
    addUrl,getFullUrl,getByIds,getAllUrl
}
