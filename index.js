const express = require('express');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const MongoUtil = require('./MongoUtil');

const app = express();

app.use(express.json());

app.use(cors());

const port = 3000;

const species_collection="species";
const distribution_collection="distribution";

console.log(process.env.MONGO_URI)

function trim(array) {
    array = array.map(eachItem => eachItem.trim())
    console.log(array)
    return array
}

trim('hello   ', '     bye');

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
                petalPattern, floralGrouping, imageUrl
            } = req.body

            let hybridParents = req.body.hybridParents || [];
            hybridParents = Array.isArray(hybridParents) ? hybridParents : [hybridParents];

            let colours = req.body.colours || [];
            colours = Array.isArray(colours) ? colours : [colours];

            let scents = req.body.scents || [];
            scents = Array.isArray(scents) ? scents : [scents];

            let creatorNameExpress = req.body.creation.creatorName;
            let creationYearExpress = parseInt(req.body.creation.creationYear);
            let distributionExpress = req.body.distributionId;
            let conservationStatusExpress = req.body.conservationStatusId;
            

            const db = MongoUtil.getDB();

            await db.collection(species_collection).insertOne({
                commonName,
                officialName,
                genus,
                species,
                hybridParents,
                creation: {
                    'creatorName': creatorNameExpress,
                    'creationYear': creationYearExpress
                },
                colours,
                petalPattern,
                scents,
                floralGrouping,
                imageUrl,
                distribution: ObjectId(distributionExpress),
                conservationStatus: ObjectId(conservationStatusExpress),
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

            let criteria = {};

            if(req.query.commonName) {
                criteria['commonName'] = {
                    '$regex': req.query.commonName,
                    '$options': 'i'
                }
            }

            if(req.query.officialName) {
                criteria['officialName'] = {
                    '$regex': req.query.officialName,
                    '$options': 'i'
                }
            }

            if(req.query.genus) {
                criteria['genus'] = {
                    '$regex': req.query.genus,
                    '$options': 'i'
                }
            }

            // query within objects??
            if(req.query.creationYearBefore) {
                criteria['creation.creationYear'] = {
                    '$lte': parseInt(req.query.creationYearBefore),
                }
            }

            if(req.query.creationYearAfter) {
                criteria['creation.creationYear'] = {
                    '$gte': parseInt(req.query.creationYearAfter),
                }
            }

            if(req.query.colours) {
                criteria['colours']={
                    '$in': [req.query.colours]
                }
            }

            const db = MongoUtil.getDB();

            let species = await db.collection(species_collection).find(criteria, {
                'projection': {
                    "commonName": 1,
                    "officialName": 1,
                    "genus":1,
                    "creation.creatorName": 1,
                    "creation.creationYear": 1,
                    "colours":1,
                    "imageUrl":1,
                    "distribution": 1,
                    "conservationStatus": 1
                    //how to project distribution name and conservationStatus name instead of id?
                }
            }).toArray();

            res.status(200).send(species)
        } catch (e) {
            res.status(500).send({"message":"Internal server error. Please contact administrator"})
        }
    })

    app.put('/orchid_species/:id', async function(req, res){

    })

}

main();

app.listen(port, function(){
    console.log("Server has started")
})