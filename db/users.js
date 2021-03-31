require('dotenv').config();
const mongodb=require('mongodb');
const mongoClient=mongodb.MongoClient;
const db_url=process.env.DB_URL;
const db_name=process.env.DB_NAME;
const users_collection='users';
const {getById}=require('./urls.js');


let checkEmail=async(email)=>{
    try{
        const clientInfo=await mongoClient.connect(db_url);
        
        const db=await clientInfo.db(db_name,{ useUnifiedTopology: true });
        let data=await db.collection(users_collection).findOne({'email':{
            $eq:email
        }});
        clientInfo.close();
        return data;
    }
    catch(err)
    {
        throw err;
    }
    
}
let addUser=async(name,password,email)=>{
    try{
        const clientInfo=await mongoClient.connect(db_url);
        const db=await clientInfo.db(db_name);
        const data = await db.collection(users_collection).insertOne({
            name,password,email,
            urls:[]
        })
        clientInfo.close();
    }
    catch(err)
    {
        throw err;
    }
}
let login=async(username)=>{
    try{
        const clientInfo=await mongoClient.connect(db_url);
        const db=await clientInfo.db(db_name);
        const data=await db.collection(users_collection)
        .findOne({"name":{
            $eq:username
        }});
        clientInfo.close();
     
        return data;
    }
    catch(err)
    {
        throw err;
    }
}
let checkUsername=async(username)=>{
    try{
        const clientInfo=await mongoClient.connect(db_url);
        const db=await clientInfo.db(db_name);
        const data=await db.collection(users_collection)
        .findOne({"name":{
            $eq:username
        }});
        clientInfo.close();
        return data;
    }
    catch(err)
    {
        throw err;
    }
}
let updatePassword=async(email,password)=>{
    try{
        const clientInfo=await mongoClient.connect(db_url);
        const db=await clientInfo.db(db_name);
        const data=await db.collection(users_collection).updateOne({"email":{$eq:email}},{$set:{"password":password}});
        clientInfo.close();
    }
    catch(err)
    {
        throw err;
    }
}
let updateUrl=async(email,urls)=>{
    try{
        const clientInfo=await mongoClient.connect(db_url);
        const db=await clientInfo.db(db_name);
        const data=await db.collection(users_collection).updateOne({"email":{$eq:email}},{$set:{"urls":urls}});
        clientInfo.close();
    }
    catch(err)
    {
        throw err;
    }
}
let getAllUrl=async(urls,offset)=>{
   try{
        let result=[];
        for(let i=offset;i<urls.length && i<offset+5;i++)
        {
            let tmp=await getById(urls[i]);
            result.push(tmp);
        }
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
    checkEmail,addUser,login,checkUsername,updatePassword,updateUrl,getAllUrl
}