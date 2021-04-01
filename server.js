require('dotenv').config();


const cors=require('cors');
const jwt=require('jsonwebtoken');


const express=require('express');
const app=express();
app.use(cors());
const PORT=process.env.PORT || 3000;

const base64=require('base-64');

const bcrypt=require('bcrypt');
const SR=process.env.SALT_ROUNDS;

const hashPass=async(password)=>{
    try{
        const salt=await bcrypt.genSalt(+SR);
        const hash=await bcrypt.hash(password,salt);
        return hash;
    }
    catch(err)
    {
        throw err;
    }

}

const nodeMailer=require('nodemailer');
const transporter=nodeMailer.createTransport({
    host:process.env.HOST,
    auth:{
        user:process.env.USER,
        pass:process.env.PASS
    },
    tls:{
        rejectUnauthorized:false
    }

})

app.use(express.json());
app.use(express.urlencoded({extended:true}))



const {checkEmail,addUser,login,checkUsername,updatePassword,updateUrl} =require('./db/users.js');
const {addUrl,getFullUrl,getAllUrl}=require('./db/urls.js');
const {generateShort}=require('./utilities/short_id_generator.js');


app.post('/register',async(req,res)=>{
    try{
        let email=req.body.email;
        let check=await checkEmail(email);
        if(check)
        {
            console.log("exists")
            res.json({
                message:"User Already Exists!"
            })
        }
        else
        {
           const encrypted_mail=base64.encode(email);
           const href=`${process.env.FRONT_URL}/register/${encrypted_mail}`;
           let html=`<a href=${href}>Click Here</a> to verify your E-Mail`;
           
           let info =await transporter.sendMail({
               from:"Sahil Alam",
               to:email,
               subject:"Verify your mail!",
               text:"Please Click on the below link to verify your mail.",
               html:`${html}`
           });

           res.status(200).json({
               message:"Mail Sent !!! Please Check your mail",
               info
           })

        }
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({
            message:err.message
        });
    } 
});


app.post('/register/:encrypted_mail',async(req,res)=>{
    try
    {
        let encrypted_mail=req.params.encrypted_mail;
        const email=base64.decode(encrypted_mail);
        const username=req.body.username;
        const password=req.body.password;
        if(username.length && password.length)
        {
            let check=await checkUsername(username);
            if(check)
            {
                res.json({
                    message:"Username already taken,try again with different username"
                })
            }
            else
            {
                const hash= await hashPass(password);
                await addUser(username,hash,email);
                res.status(201).json({
                    message:"User Created!"
                });
            }
        }
        else
        {
            res.status(500).json({
                message:"Either Username or password is empty!"
            });
        }  

    }
    catch(err)
    {
        console.log(err);
        res.status(404).json({
            message:err.message
        });
    }
})


app.post('/login',async(req,res)=>{
    let username=req.body.username;
    let password=req.body.password;
    try{
        const data=await login(username);
        if(data)
        {
            const result=await bcrypt.compare(password,data.password);
            if(result)
            {
                const access_token =await jwt.sign({
                    name:data.name,
                    email:data.email
                },process.env.KEY,{
                    expiresIn:'1h'
                });
                res.status(200).json({
                    access_token,
                    urls:data.urls
                    
                })
            }
            else
            {
                res.status(404).json({
                    message:"Invalid Password"
                })   
            }

        }
        else
        {
            res.status(404).json({
                message:"User Not Found!"
            });
        }
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({
            message:err.message
        });
    }
}) 

app.post('/forgot_password',async(req,res)=>{
    try{
        let email=req.body.email;
        let check=await checkEmail(email);
        if(check)
        {
            const encrypted_mail=base64.encode(email);
           const href=`${process.env.FRONT_URL}/forgot_password/${encrypted_mail}`;
           let html=`<a href=${href}>Click Here</a> to update your passowrd`;
           
           let info =await transporter.sendMail({
               from:"Sahil Alam",
               to:email,
               subject:"Update your Password!",
               html:`${html}`
           });

           res.status(200).json({
               message:"Mail Sent !!! Please Check your mail"
           })
        }
        else
        {
            res.status(404).json({
                message:"No user fornd with this e-mail"
            })
        }

    }
    catch(err)
    {
        res.status(500).json(
            {
                message:err.message
            }
        )
    }
})

app.put('/forgot_password/:encrypted_mail',async(req,res)=>{
    try{
        let encrypted_email=req.params.encrypted_mail;
        let email=base64.decode(encrypted_email);
        let password=req.body.password;
        const hash=await hashPass(password);
        await updatePassword(email,hash);
        res.status(200).json({
            message:"Password Updated! Please Login to continue.."
        })
    }
    catch(err)
    {
        res.status(500).json(
            {
                message:err.message
            }
        )
    }
})

app.post('/generate',async(req,res)=>{
    try{
        let access_token=req.headers.authorization;
        let decoded=await jwt.verify(access_token,process.env.KEY);
        if(decoded)
        {
            let email=decoded.email;
            let full=req.body.full;
            let short=await generateShort();
            await addUrl(short,full,email,checkEmail,updateUrl);
            res.status(201).json(
                {
                    new_url:req.get("host")+'/'+short
                }
            )
        }
        else
        {
            res.status(401).json({
                message:"Session Expired,Please Login Again!"
            })
        }

    }
    catch(err)
    {
        res.status(500).json({
            message:err.message
        })
    }
})
app.post('/getallurl/:offset',async(req,res)=>{
    try{
        let access_token=req.headers.authorization;
        let decoded=await jwt.verify(access_token,process.env.KEY);
        if(decoded)
        {
            let offset=req.params.offset;
            let user=await checkEmail(decoded.email);
           
            let data=await getAllUrl(user.urls,offset);
        
            res.status(200).json({
                data:data.result,
                next:data.next,
                prev:data.prev

            })

        }
        else
        {
            res.status(401).json({
                message:"Session Expired,Please Login Again!"
            })
        }
        

    }
    catch(err)
    {
        res.status(500).json({
            message:err.message
        })
    }
})

app.get('/verify_token&get_user_details',async(req,res)=>{
    try{
        let access_token=req.headers.authorization;
        let decoded=await jwt.verify(access_token,process.env.KEY);
        if(decoded)
        {
            res.status(200).json(
                {
                    data:decoded
                }
            )
        }
        else
        {
            res.status(401).json({
                message:"Session Expired,Please Login Again!"
            })
        }

    }
    catch(err)
    {
        res.status(500).json({
            message:err.message
        })
    }

})

app.get('/:short',async(req,res)=>{
    try{
        let short=process.env.SERVER_URL+req.params.short;
        let full=await getFullUrl(short);
        res.status(200).redirect(full);
    }
    catch(err)
    {
        res.status(500).json({
            message:err.message
        })
    }

})




app.listen(PORT,()=>{
    console.log("SERVER STARTED",PORT)
})
