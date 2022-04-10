# The Daily Orchid - RESTful API

[Trent Global College](https://www.trentglobal.edu.sg/)
 * Software Development BootCamp
 * Diploma in Web Application Development
 * Project 2

The front-end repository can be found [here](https://github.com/caracara6/project2-react).


## Context 

Project premise is building a RESTful API wtih MongoDB and Express.js, and performing CRUD using the endpoints.

## Collections in database

There are four collections, two of which (distribution and conservation) are static and maintained by admin.

1. Species Collection (dynamic)
Sample document: 
```
{
    "_id" : ObjectId(<_id - string>)
    "commonName": "Vanda Miss Joaquim",
    "officialName": "Papilionanthe Miss Joaquim",
    "genus": "Papilionanthe",
    "hybridParents": ["Papilionanthe teres", "Papilionanthe hookeriana"],
    "creation": 
        {
            "creatorName": "Henry Ridley",
            "creationYear": 1893
        }
    ,
    "colours": ["purple", "pink"],
    "petalPattern": "solid",
    "scents": ["sweet"],
    "floralGrouping": "cluster",
    "imageUrl": "example image url",
    "distribution": ObjectId(<_id - string>),
    "conservationStatus": ObjectId(<_id - string>),
    "facts": [
        {
            _id : ObjectId(_id - string)
            "fact": "example fact"
        }
    ]
}
```

2. Users Collection (dynamic)
Sample document: 
```
{
    _id: ObjectId(_id - string),
    userEmail: 'example@example.com',
    favourites: [ 
        ObjectId(_id - string),
        ObjectId(_id - string)
        ]
}
```
## Technologies Used

* [MongoDB Atlas](https://www.mongodb.com/)
    * Cloud document-oriented database

* [Express.js](https://expressjs.com/)
    * Web framework for Node.js

* [dotenv](https://www.npmjs.com/package/dotenv)
    * Stores environment variables separate from code

* [Heroku](https://id.heroku.com/login)
    * API host

* [yup](https://github.com/jquense/yup)
    * Library for schema validation

* [Advanced REST Client](https://github.com/advanced-rest-client)
    * for testing handling HTTP requests

