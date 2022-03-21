const express = require('express');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const MongoUtil = require('./MongoUtil');

const app = express();

app.use(express.json());

app.use(cors());

const port = 3000;

const orchids_collection="species";
const regions_collection="distribution";

console.log(process.env.MONGO_URI)

async function main() {
    await MongoUtil.connect(process.env.MONGO_URI, "tgc16_p2_orchids");
    app.get('/', (req, res) => {
        res.send('Hello World')
    })

    //create orchid species document and insert into species collection
    app.post ('/orchid_species', async function(req, res){
        try{
            let {
                commonName, officialName, genus, species,
                petalPattern, floralGrouping, imageUrl, conservationStatus
            } = req.body

            let hybridParents = req.body.hybridParents || [];
            hybridParents = Array.isArray(hybridParents) ? hybridParents : [colours];

            let colours = req.body.colours || [];
            colours = Array.isArray(colours) ? colours : [colours];

            let scents = req.body.scents || [];
            scents = Array.isArray(scents) ? scents : [scents];

            let creatorNameExpress = req.body.creatorName;
            let creationYearExpress = req.body.creationYear;
            let distributionExpress = req.body.distribution_id;
            

            const db = MongoUtil.getDB();

            await db.collection(orchids_collection).insertOne({
                commonName,
                officialName,
                genus,
                species,
                hybridParents,
                creation: {
                    'creatorName': creatorNameExpress,
                    'creationYear': creationYearExpress
                },
                petalPattern,
                scents,
                floralGrouping,
                imageUrl,
                distribution: ObjectId(distributionExpress),
                conservationStatus,
                facts:[]
            })
            res.status(200).send({"message":"The record has been added"})
        } catch (e){
            res.status(500).send({"message":"Internal server error. Please contact administrator"})
            console.log(e)
        }
    })

    // read orchids species collection
    app.get('/orchid_species', async function(req, res){
        try {
            const db = MongoUtil.getDB();

            let criteria = {};

            if(req.query.commonName) {
                criteria['commonName'] = {
                    '$regex': req.query.commonName,
                    '$options': 'i'
                }
            }

            if(req.query.officialName) {
                criteria['officialName'] = {
                    '$regex': req.query.commonName,
                    '$options': 'i'
                }
            }

            if(req.query.officialName) {
                criteria['officialName'] = {
                    '$regex': req.query.commonName,
                    '$options': 'i'
                }
            }






        }
    })

}

main();

app.listen(port, function(){
    console.log("Server has started")
})