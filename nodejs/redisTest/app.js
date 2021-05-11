const redis = require('redis');
const axios = require("axios");

const redisClient = redis.createClient({
    host:'127.0.0.1',
    port:6379
});
const url = " https://en.wikipedia.org/w/api.php?action=parse&format=json&section=0&page=usa";

//db
let db;
const MongoClient = require('mongodb').MongoClient;
const mongoUrl = 'mongodb://127.0.0.1:27017/'
const col = 'country';

MongoClient.connect(mongoUrl, {useNewUrlParser:true,useUnifiedTopology: true },(err,client)=>{
    if(err) console.log(err);
    db = client.db('classpractice');
    //check if the data is already in redis
    redisClient.get('usa',(err,data)=>{
        if(err) console.log(err);
        else if (data) {
            console.log(JSON.parse(data));
        }
    })
    //check if the data is already in db
    db.collection(col).findOne().then((result)=>{
        if (!result) {
            axios.get(url).then((response) => {
                //console.log(response);
                const doc = response.data;
                db.collection(col).insertOne(doc, (err, result) => {
                    if (err) console.log(err);
                    else {
                        redisClient.set('usa', JSON.stringify(result));
                        console.log(result);
                    }
                });
            }).catch((error) => {
                console.log(error);
            })
        } else {
            redisClient.set('usa', JSON.stringify(result));
            console.log(result);
        }
    }).catch((err)=>{
        console.log(err);
    });

})




