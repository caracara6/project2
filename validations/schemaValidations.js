const yup = require('yup')

const imgUrl = /(https?:\/\/.*\.(?:png|jpg))/i

speciesSchema = yup.object({
    commonName: yup.string().min(5).required(),
    officialName: yup.string().min(5).required(),
    genus: yup.string().min(3).required(),
    // species: yup.string().min(3),
    hybridParents: yup.array().of(yup.string()),
    creation: yup.object({
        creatorName: yup.string(),
        creationYear: yup.string()
        // yup.number().positive().integer()
    }),
    colours: yup.array().of(yup.string()).required(),
    petalPattern: yup.string().required(),
    scents: yup.array().of(yup.string()).required(),
    floralGrouping: yup.string(),
    imageUrl:  yup.string().matches(imgUrl,'URL is not valid').required(),
    distribution: yup.string().required(),
    conservationStatus: yup.string().required(),
    facts: yup.array().of(yup.object({fact:yup.string()}))
})

userSchema = yup.object({
    userEmail:yup.string().email("Please enter a valid email").required("Please enter your email")
})

module.exports = {speciesSchema, userSchema}