require('dotenv').config();
const mongodb=require('mongodb');
const mongoClient=mongodb.MongoClient;
const db_url=process.env.DB_URL || 'mongodb+srv://test_user:2kgk7ToFuriLABGi@cluster0.1rbp6.mongodb.net/users_db?retryWrites=true&w=majority&useUnifiedTopology=true';
const db_name=process.env.DB_NAME || 'users_db';
const shortid_collection='shortid';


let insertData=async()=>{
    try{
        const client=await mongoClient.connect(db_url);
        const db=await client.db(db_name);
        const data=await db.collection(shortid_collection).insertOne({
            first_pos:[0,0,0],
            second_pos:[0,1,1],
            third_pos:[0,2,2],
            fourth_pos:[0,0,0],
            fifth_pos:[0,1,1]
        })
        client.close();
        return data;
    }
    catch(err)
    {
        throw err;
    }
}
let getData=async()=>{
    try{
        const client=await mongoClient.connect(db_url);
        const db=await client.db(db_name);
        const data=await db.collection(shortid_collection).find().toArray();
        client.close();
        return data[0];
    }
    catch(err)
    {
        throw err;
    }
}
let updateData=async(ob)=>{
    try{
        const client=await mongoClient.connect(db_url);
        const db=await client.db(db_name);
        const data=await db.collection(shortid_collection).updateOne({},{$set:ob});
        client.close();
        return data;
    }
    catch(err)
    {
        throw err;
    }
}

module.exports={
    getData,updateData
}

