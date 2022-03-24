const express = require('express');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const MongoUtil = require('./MongoUtil');
const validation = require('./middleware/validationMiddleware');
const schema = require('./validations/schemaValidations');

const app = express();

app.use(express.json());

app.use(cors());

const port = 3000;

const speciesCollection="species";
const usersCollection="users"

console.log(process.env.MONGO_URI)

function trimAway(array) {
    array = array.map(eachItem => eachItem.trim())
    console.log(array)
    return array
}

async function main() {
    await MongoUtil.connect(process.env.MONGO_URI, "tgc16_p2_orchids");
    // app.get('/', (req, res) => {
    //     res.send('Hello World')
    // })

    //create orchid species document and insert into species collection
    //check for duplicates in officialName in posting??
    app.post ('/orchid_species', validation.validation(schema.speciesSchema), async function(req, res){
        console.log("===================post orchid species================")
        try{
            let {
                commonName, officialName, genus, species,
                petalPattern, floralGrouping, imageUrl
            } = req.body

            let hybridParents = req.body.hybridParents || [];
            hybridParents = Array.isArray(hybridParents) ? hybridParents : [hybridParents];
            trimAway(hybridParents);

            let colours = req.body.colours || [];
            colours = Array.isArray(colours) ? colours : [colours];
            trimAway(colours);

            let scents = req.body.scents || [];
            scents = Array.isArray(scents) ? scents : [scents];
            trimAway(scents);

            let creatorNameExpress = req.body.creation.creatorName;
            let creationYearExpress = parseInt(req.body.creation.creationYear);
            let distributionExpress = req.body.distributionId;
            let conservationStatusExpress = req.body.conservationStatusId;
            
            let fact = req.body.facts[0].fact
            
            const db = MongoUtil.getDB();

            let results = await db.collection(speciesCollection).insertOne({
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
                            facts:[
                                {
                                    '_id': new ObjectId(),
                                    'fact' : fact,
                                    'datePosted':new Date()
                                }
                            ]
                        })
            res.status(200).send(results)
        } catch (e){
            res.status(500).send({"message":"Internal server error. Please contact administrator"})
            console.log(e)
        }
    })

    //redo
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

            let species = await db.collection(speciesCollection).find(criteria, {
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

    //working
    // update document in orchids species collection
    app.put('/orchid_species/:species_id', validation.validation(schema.speciesSchema), async function(req, res){
        try{
            let {
                commonName, officialName, genus, species,
                petalPattern, floralGrouping, imageUrl
            } = req.body

            let hybridParents = req.body.hybridParents || [];
            hybridParents = Array.isArray(hybridParents) ? hybridParents : [hybridParents];
            trimAway(hybridParents);

            let colours = req.body.colours || [];
            colours = Array.isArray(colours) ? colours : [colours];
            trimAway(colours);

            let scents = req.body.scents || [];
            scents = Array.isArray(scents) ? scents : [scents];
            trimAway(scents);

            let creatorNameExpress = req.body.creation.creatorName;
            let creationYearExpress = parseInt(req.body.creation.creationYear);
            let distributionExpress = req.body.distributionId;
            let conservationStatusExpress = req.body.conservationStatusId;

            // need to extract out facts in order to not erase facts with every update

            const db = MongoUtil.getDB();

            let results = await db.collection(speciesCollection).updateOne({
                '_id': ObjectId(req.params.species_id)},
                {
                    '$set':{
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
                    }
                
            })

            res.status(200).send(results)

        } catch(e){
            res.status(500).send({"message":"Internal server error. Please contact administrator"})
        }
    })

    //working
    // create new fact for specific species
    app.post('/orchid_species/:species_id/facts', async function(req, res){
        try{
            let fact = req.body.fact;

            const db = MongoUtil.getDB();

            let results = await db.collection(speciesCollection).updateOne({
                '_id': ObjectId(req.params.species_id)
            },{ 
                '$push' : {
                    'facts': {
                        '_id' : new ObjectId(),
                        fact,
                        'datePosted': new Date()
                    }
                }
            })
            res.status(200).send(results)
        } catch(e){
            res.status(500).json({"message":"Internal server error. Please contact administrator"})
        }
    })

    //working
    //update a fact in species collection
    app.put('/orchid_species/:species_id/facts/:fact_id', async function(req, res){
        try{
        await MongoUtil.getDB().collection(speciesCollection).updateOne({
            '_id':ObjectId(req.params.species_id),
            'facts._id':ObjectId(req.params.fact_id)
        },{
            '$set' : {
                'facts.$.fact': req.body.fact
            }
        })
        res.status(200).send('fact updated successfully')
        } catch(e){
            res.status(500).json({"message":"Internal server error. Please contact administrator"})
        }
    }) 

    //working
    //get all facts of specific orchid
    app.get('/orchid_species/:species_id/facts', async function(req, res){
        try{
            let results = await MongoUtil.getDB()
                        .collection(speciesCollection)
                        .findOne(
                            {
                                '_id':ObjectId(req.params.species_id)
                            },{
                                'projection': {
                                    'officialName':1,
                                    'facts':1
                                }
        })
        res.status(200).json(results)
        } catch(e){
            res.status(500).json({"message":"Internal server error. Please contact administrator"})
        }
    })

    //working
    //delete a fact in species collection
    app.delete('/orchid_species/:species_id/facts/:fact_id', async function(req, res){
        try {
            await MongoUtil.getDB().collection(speciesCollection).deleteOne({
                '_id': ObjectId(req.params.species_id),
                'facts._id' : ObjectId(req.params.fact_id)
            })
            res.status(200).send('fact deleted successfully')
        } catch(e) {
            res.status(500).send({"message":"Internal server error. Please contact administrator"})
        }
    })

    //working
    //create new user in users collection
    app.post('/users', validation.validation(schema.userSchema), async function(req, res){
        try{
            let results = await MongoUtil.getDB().collection(usersCollection).insertOne({
                userEmail: req.body.userEmail,
                favourites : []
        })
        res.status(200).json(results)
        } catch(e) {
            res.status(500).send({"message":"Internal server error. Please contact administrator"})
            console.log(e)
        }
    })

    //working
    //edit user email in users collection
    app.put('/users/:user_id', validation.validation(schema.userSchema), async function(req, res){
        try{
            console.log(req.params.user_id)
            let results = await MongoUtil.getDB().collection(usersCollection).updateOne({
                '_id':ObjectId(req.params.user_id)
            },{
                '$set': {
                    userEmail: req.body.userEmail
                }
            })
            res.status(200).send(results)

        } catch(e) {
            res.status(500).send({"message":"Internal server error. Please contact administrator"})
            console.log(e)
        }
    })

    //working
    //delete user in users collection
    app.delete('/users/:user_id', async function (req, res){
        try {
            await MongoUtil.getDB().collection(usersCollection).deleteOne({
                '_id': ObjectId(req.params.user_id)
            })
            res.status(200).send("User deleted successfully")
        } catch(e) {
            res.status(500).send({"message":"Internal server error. Please contact administrator"})
            console.log(e)
        }
    })

    //working
    //add new favourite to user
    app.post('/users/:user_id/favourites/:species_id', async function(req, res){
        try{
            const db = MongoUtil.getDB();

            let results = await db.collection(usersCollection).updateOne({
                "_id":ObjectId(req.params.user_id)
            },{
                '$push':{
                    'favourites': ObjectId(req.params.species_id)
                }
            })

            res.status(200).send(results)
        } catch(e){
            res.status(500).send({"message":"Internal server error. Please contact administrator"})
            console.log(e)
        }
    })

    //working
    //read all favourites by a user
    app.get('/users/:user_id/favourites', async function(req, res){
        try{
            const db = MongoUtil.getDB();
            let results = await db.collection(usersCollection).findOne({
                '_id':ObjectId(req.params.user_id)
            },{
                'projection': {
                    "_id" : 0,
                    'favourites':1
                }
            });
            console.log(results)

            res.status(200).send(results)
        } catch(e) {
            res.status(500).send({"message":"Internal server error. Please contact administrator"})
            console.log(e)
        }
    })

    //working
    //delete a favourite from particular user in users collection
    app.delete('/users/:user_id/favourites/:species_id', async function (req, res){
        try {
            console.log(req.params.species_id, req.params.user_id)
            const db = MongoUtil.getDB();
            await db.collection(usersCollection).updateOne({
                '_id': ObjectId(req.params.user_id)
            },{
                '$pull' : {
                    'favourites': ObjectId(req.params.species_id)
                }
            })
            res.status(200)
            res.send("done")
        } catch(e) {
            res.status(500).send({"message":"Internal server error. Please contact administrator"})
            console.log(e)
        }
    })



}

main();

app.listen(process.env.PORT || port, function(){
    console.log("Server has started")
})