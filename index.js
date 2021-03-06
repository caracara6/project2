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

const port = 8888;

const speciesCollection="species";
const usersCollection="users"

// utils
const utils = require('./utils.js')

console.log(process.env.MONGO_URI)

function trimAway(array) {
    array = array.map(eachItem => eachItem.trim())
    return array
}

async function main() {
    await MongoUtil.connect(process.env.MONGO_URI, "tgc16_p2_orchids");
    app.get('/', (req, res) => {
        res.send(`Welcome to The Daily Orchid's RESTful API.`)
    })

    //working
    //create orchid species document and insert into species collection
    app.post ('/orchid_species', validation.validation(schema.speciesSchema), async function(req, res){
        console.log("===================post orchid species================")
        try{
            let {
                commonName, officialName, genus, 
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
            let distributionExpress = req.body.distribution;
            let conservationStatusExpress = req.body.conservationStatus;
                        
            const db = MongoUtil.getDB();

            let results = await db.collection(speciesCollection).insertOne({
                            commonName,
                            officialName,
                            genus,
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
            res.status(200).send(results)
        } catch (e){
            res.status(500).send({"message": e})
            console.log(e)
        }
    })

    //working
    // read orchids species collection
    app.get('/orchid_species', async function(req, res){
        try {

            let criteria = {};
            let searchTextFields = ["commonName", "officialName", "genus", "petalPattern"];

            // criteria['$or'] = [
                            //     {
                            //         "commonName" : {
                            //             "$regex": eachWord,
                            //             "$options" : "i"
                            //         }
                            //     }
                            // ]

            if(req.query.searchPrompt) {
                criteria['$or'] = [];
                req.query.searchPrompt.split(" ").map(
                    eachWord => {
                        if (eachWord.trim().length > 0){
                            for (let field of searchTextFields) {
                                criteria['$or'].push(
                                    {
                                        [field]: {
                                            '$regex': eachWord,
                                            '$options': 'i'
                                        }
                                    }
                                )
                            }

                            //search other fields here in future?
                        }
                    }
                )
            }

            if(req.query.colourFilter) {
                criteria['colours']={
                    '$in': req.query.colourFilter
                }
            }

            if(req.query.distributionFilter && req.query.distributionFilter !== 'noDistributionSelected'){
                criteria['distribution'] = ObjectId(req.query.distributionFilter)
            }

            if(req.query.conservationFilter && req.query.conservationFilter !== 'noConservationSelected'){
                criteria['conservationStatus'] = ObjectId(req.query.conservationFilter)
            }

            if(req.query.noFacts){
                criteria['facts'] = {
                    '$size': parseInt(req.query.noFacts)
                }
            }

            if(req.query.factsGte3){
                criteria['facts.2'] = {
                    '$exists': true
                }
            }

            if(req.query.userFavouriteIds){
                criteria['$or'] = [];
                req.query.userFavouriteIds.map(
                    eachId => criteria['$or'].push(
                        {
                            _id: ObjectId(eachId)
                        }
                    )
                )
            }

            let results = await MongoUtil.getDB().collection(speciesCollection).find(criteria).toArray();

            // console.log('criteria ==>' + JSON.stringify(criteria))
            res.status(200).send(results)
        } catch (e) {
            res.status(500).send({"message": e})
        }
    })

    app.get('/orchid_species/user_favourites', async function(req, res){
        try{

            let criteria = {};

            if(req.query.userFavouriteIds){
                criteria['$or'] = [];
                req.query.userFavouriteIds.map(
                    eachId => criteria['$or'].push(
                        {
                            _id: ObjectId(eachId)
                        }
                    )
                )
                let results = await MongoUtil.getDB().collection(speciesCollection).find(criteria).toArray();

                // console.log('criteria ==>' + JSON.stringify(criteria))
                res.status(200).send(results)
            } else{
                res.status(200).send([])
            }
        } catch(e){
            res.status(500).send({"message": e})
        }
    })

    //get specific document in species collection
    app.get('/orchid_species/:species_id', async function(req, res){
        try{
            let results = await MongoUtil.getDB().collection(speciesCollection).findOne({
                '_id':ObjectId(req.params.species_id)
            })
            res.status(200).send(results);
        } catch (e) {
            res.status(500).send({"message":"Internal server error. Please contact administrator"})
        }
    })

    //working
    // update document in orchids species collection
    app.put('/orchid_species/:species_id', validation.validation(schema.speciesSchema), async function(req, res){
        try{
            let {
                commonName, officialName, genus, 
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
            let distributionExpress = req.body.distribution;
            let conservationStatusExpress = req.body.conservationStatus;

            const db = MongoUtil.getDB();

            let results = await db.collection(speciesCollection).updateOne({
                '_id': ObjectId(req.params.species_id)},
                {
                    '$set':{
                        commonName,
                        officialName,
                        genus,
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
    //delete a specific document from species collection
    app.delete('/orchid_species/:species_id', async function(req, res){
        try{
            await MongoUtil.getDB().collection(speciesCollection).deleteOne({
                '_id': ObjectId(req.params.species_id)
            })
            res.status(200).send({'message': "This species has been deleted successfully. You will now be redirected to the main page. "})
        }   catch(e){
            res.status(500).send({'message': e})
            console.log(e)
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
                                    '_id':0,
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
            await MongoUtil.getDB().collection(speciesCollection).updateOne({
                '_id': ObjectId(req.params.species_id)
            },{
                '$pull':{
                    'facts':{
                        '_id' : ObjectId(req.params.fact_id)
                    }
                }
            })
            res.status(200).send('fact deleted successfully')
        } catch(e) {
            res.status(500).send({"message":"Internal server error. Please contact administrator"})
        }
    })

    //working
    //get all regions in distribution collection
    app.get('/distribution', async function(req, res){
        try{
            let results = await MongoUtil.getDB().collection('distribution').find().toArray();
            res.status(200).send(results);
        } catch (e) {
            res.status(500).send({"message":"Internal server error. Please contact administrator"})
        }
    })

    app.get('/distribution/:distribution_id', async function(req, res){
        try{
            let results = await MongoUtil.getDB().collection('distribution').findOne({
                '_id':ObjectId(req.params.distribution_id)
            })
            res.status(200).send(results);
        } catch (e) {
            res.status(500).send({"message":"Internal server error. Please contact administrator"})
        }
    })

    //working
    //get all conservation statuses in conservation collection
    app.get('/conservation', async function(req, res){
        try{
            let results = await MongoUtil.getDB().collection('conservation').find().toArray();
            res.status(200).send(results);
        } catch (e) {
            res.status(500).send({"message":"Internal server error. Please contact administrator"})
        }
    })

    //working
    //create new user in users collection
    app.post('/users', validation.validation(schema.userSchema), async function(req, res){

        let {userEmail} = req.body

        try{

            if(!(await utils.checkEmailDuplicate(userEmail))){
                throw "This email is already registered on this website"
            }
            let results = await MongoUtil.getDB().collection(usersCollection).insertOne({
                userEmail,
                favourites : []
            })

        res.status(200).send(results)
        } catch(e) {
            res.status(500).send({"message": e})
        }
    })

    //working
    //edit user email in users collection
    app.put('/users/:user_id', validation.validation(schema.userSchema), async function(req, res){
        
        let {userEmail} = req.body

        try{

            if(!(await utils.checkEmailDuplicate(userEmail))){
                throw "This email is already registered on this website"
            }

            let results = await MongoUtil.getDB().collection(usersCollection).updateOne({
                '_id':ObjectId(req.params.user_id)
            },{
                '$set': {
                    userEmail
                }
            })
            res.status(200).send(results)

        } catch(e) {
            res.status(500).send({"message": e})
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
    //read all information of a user
    app.get('/users', async function(req, res){
        try{
            let results = await MongoUtil.getDB().collection(usersCollection).findOne({
                userEmail:req.query.userEmail
            }
            );

            if(!results){
                throw "This email is not registered with this website."
            }

            res.status(200).send(results)
        } catch(e) {
            res.status(500).send({"message": e})
        }
    })

    //working
    //get user favourites of species ids
    app.get('/users/:user_id', async function(req, res){
        try{
            let results = await MongoUtil.getDB().collection(usersCollection).findOne({
                '_id': ObjectId(req.params.user_id)
            },{
                'projection': {
                    _id:0,
                    favourites: 1
                }
            }
            )
            res.status(200).send(results)
        } catch(e) {
            res.status(500).send({"message": e})
        }
    })

    //working
    //delete a favourite from specific user in users collection
    app.delete('/users/:user_id/favourites/:species_id', async function (req, res){
        try {
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

app.listen(process.env.PORT, function(){
    console.log("Server has started")
})