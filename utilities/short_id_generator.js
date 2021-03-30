const A=['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
const a=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
const nums=[0,1,2,3,4,5,6,7,8,9];
const arr=[A,a,nums];
const curr_pos=['first_pos','second_pos','third_pos',"fourth_pos",'fifth_pos'];

let {getData,updateData}=require("../db/shortid.js");

let helper=(data,curr_pos_idx)=>
{
    if(curr_pos_idx===curr_pos.length)
    {
        return ["",data];
    }
    let curr_idx=data[curr_pos[curr_pos_idx]][0];
    let curr_arr_idx=data[curr_pos[curr_pos_idx]][1];
    let curr_pos_init_idx=data[curr_pos[curr_pos_idx]][2];
    let result="";
    let limit=0;
    if(curr_arr_idx===2)
    {
        limit=nums.length;
    }
    else
    {
        limit=A.length;
    }
    if(curr_idx===limit)
    {
        curr_idx=data[curr_pos[curr_pos_idx]][0]=0;
        curr_arr_idx=data[curr_pos[curr_pos_idx]][1]=(curr_arr_idx=data[curr_pos[curr_pos_idx]][1]+1)%3;
        if(curr_arr_idx===curr_pos_init_idx)
        {
            data[curr_pos[(curr_pos_idx+1)%curr_pos.length]][0]=data[curr_pos[(curr_pos_idx+1)%curr_pos.length]][0]+1;
        }
    }
    result=arr[curr_arr_idx][curr_idx];
    if(curr_pos_idx===0)
    {
        data[curr_pos[curr_pos_idx]][0]+=1;
    }
    
    let returned=helper(data,curr_pos_idx+1);
    result+=returned[0];
    return [result,returned[1]];
}
let generateShort=async()=>{
    try{
        
        let data=await getData();
        let result=helper(data,0);
        await updateData(result[1]);
        return result[0];
    }
    catch(err)
    {
        throw err;
    }
}
module.exports={
    generateShort
}