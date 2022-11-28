const express =require('express')
const cors=require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt=require ('jsonwebtoken')
require('dotenv').config()
const app=express()
const port=process.env.PORT || 5000
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster0.jq2it7m.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req,res,next){
    
    const authHeader=req.headers.authorization
    if(!authHeader){
        return res.status(401).send('unauthorised')
    }
    const token=authHeader.split(' ')[1]
    jwt.verify(token,process.env.ACCESS_TOKEN,function(err,decoded){
        if(err){
            return res.status(403).send({message:'forbidden access'})
        }
        req.decoded=decoded
        next();
    })
}

async function run(){

    try{
        const allBrandCollection=client.db('wholesale').collection('allbrand')
        const bookingPhone=client.db('wholesale').collection('booking')
        const userCollection=client.db('wholesale').collection('users')
        const sellerProductCollection=client.db('wholesale').collection('sellerProduct')
        const advertiseProductCollection=client.db('wholesale').collection('advertiseProduct')
        app.get('/allbrand/:brand',async(req,res)=>{
            const brand=req.params.brand;
            const query={brand:brand}
            const result=await sellerProductCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/booking',async(req,res)=>{
            const email=req.query.email
            const cursor={email:email}
            const result=await bookingPhone.find(cursor).toArray()
            res.send(result)
        })
        app.post('/booking',async(req,res)=>{
            const book=req.body;
            const result=await bookingPhone.insertOne(book)
            res.send(result)
        })

        app.get('/jwt',async(req,res)=>{
            const email=req.query.email;
            const query={email:email}
            const user=await userCollection.findOne(query)
            if(user){
                const token=jwt.sign({email},process.env.ACCESS_TOKEN,{ expiresIn:'10h' })
                return res.send({accessToken:token})
            }
           
            res.status(404).send({accessToken:''})
        })



        app.post('/users',async(req,res)=>{
            const user=req.body;
            const query={email:user.email}
            const exestingEmail= await userCollection.find(query).toArray()
            if(exestingEmail.length===0){
                const result=await userCollection.insertOne(user)
                res.send(result)
            }
            
          
        })
        app.get('/users',async(req,res)=>{
            const email=req.query.email
            const query={email:email}
            const result=await userCollection.findOne(query)
            res.send(result)
        })
        app.delete('/deleteSeller/:id',async(req,res)=>{
            const id=req.params.id;
            const query={_id:ObjectId(id)}
            const result=await userCollection.deleteOne(query)
            res.send(result)
        })
        app.get('/buyers',async(req,res)=>{
            const query={role:'buyer'}
            const result=await userCollection.find(query).toArray()
            res.send(result)
        })
        app.delete('/deleteProduct/:id',async(req,res)=>{
            const id=req.params.id;
            const query={_id:ObjectId(id)}
            const query2={_id:id}
            const advertisdelete=await advertiseProductCollection.deleteOne(query2)
            const result=await sellerProductCollection.deleteOne(query)
            res.send(result)
        })
        
        app.get('/sellers',async(req,res)=>{
            const query={role:'seller'}
            const result=await userCollection.find(query).toArray()
            res.send(result)
        })
        app.post('/sellerProduct',async(req,res)=>{
            const data=req.body;
            const result=await sellerProductCollection.insertOne(data)
            res.send(result)
        })
        app.put('/verify/:email',async(req,res)=>{
            const email=req.params.email;
            const query={email:email}
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                  verify:'verified'
                },
              };
              const result= await sellerProductCollection.updateMany(query,updateDoc,options)
              const updateUser= await userCollection.updateOne(query,updateDoc,options)
              res.send(result)
        })
        app.get('/sellerProduct',async(req,res)=>{
            const email=req.query.email;
            const query={email:email}
            const result=await sellerProductCollection.find(query).toArray()
            res.send(result)
        })
        app.post('/advertise',async(req,res)=>{
            const advertiseProduct=req.body;
            const id=advertiseProduct._id
            const query={_id:id}
            const searchid=await advertiseProductCollection.find(query).toArray()
            
            if(searchid.length===0){
                const result=await advertiseProductCollection.insertOne(advertiseProduct)
                return res.send(result)
            }
            res.send({message:'product already addedd'})
              
            
           
            
        })
        app.get('/advertise',async(req,res)=>{
            const query={}
            const result=await advertiseProductCollection.find(query).toArray()
            res.send(result)
        })
    }
    finally{

    }

}
run().catch(console.dir)

app.get('/',(req,res)=>{
    res.send('server is ok')
})

app.listen(port,()=>{
    console.log(`server is running port ${port}`)
})