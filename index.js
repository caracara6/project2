const express = require('express');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const MongoUtil = require('./MongoUtil');

const app = express();

app.use(express.json());

app.use(cors());

const port = 3000;

const COLLECTION_NAME="";

console.log(process.env.MONGO_URI)

async function main() {
    await MongoUtil.connect(process.env.MONGO_URI, "tgc16_p2_orchids");
    app.get('/', (req, res) => {
        res.send('Hello World')
    })

}

main();

app.listen(port, function(){
    console.log("Server has started")
})