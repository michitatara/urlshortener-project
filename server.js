require('dotenv').config();
const express = require('express');
const bodyParser= require("body-parser")
const cors = require('cors');
const mongoose = require('mongoose');
const urlparser= require('url');
const dns = require('dns');
const app = express();

// Basic Configuration
const mySecret = process.env['DB_URL']
const port = process.env.PORT || 3000;
mongoose.connect(mySecret, {useNewUrlParser:true, useUnifiedTopology:true});
console.log(mongoose.connection.readyState);

const schema= new mongoose.Schema({url:'string'});
const Url= mongoose.model('Url', schema);

app.use(bodyParser.urlencoded({extended:false}))
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
    console.log(req.body);
    const bodyurl= req.body.url;

    const mystuff= dns.lookup(urlparser.parse(bodyurl).hostname,
        (error, address)=>{
            if(!address){
                res.json({error:"invalid URL"})
            }else{
                const url= new Url({url:bodyurl})
                url.save((err, data)=>{
                    res.json({
                        original_url:data.url,
                        short_url:data.id
                    })
                })
            }
            console.log("dns", error);
            console.log("address", address);
        })
    console.log("mystuff",mystuff);

});

app.get("/api/shorturl/:id", (req,res)=>{
    const id= req.params.id;
    Url.findById(id, (err, data)=>{
        if(!data){
            res.json({error:"invalid URL"})
        }else{
            res.redirect(data.url)}
    })
})

// await.Url.create({url:"mk"},(err, dtaa)=>{
//   res.json({created:true})
// })

app.listen(port, function() {
    console.log(`Listening on port ${port}`);
});