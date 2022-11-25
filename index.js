const express =require('express')
const cors=require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const app=express()
const port=process.env.PORT || 5000
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster0.jq2it7m.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){

    try{
        const allBrandCollection=client.db('wholesale').collection('allbrand')
        app.get('/allbrand/:brand',async(req,res)=>{
            const brand=req.params.brand;
            const query={brand:brand}
            const result=await allBrandCollection.find(query).toArray()
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