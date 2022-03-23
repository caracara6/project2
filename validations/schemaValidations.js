const yup = require('yup')

speciesSchema = yup.object({
    commonName: yup.string().min(5),
    officialName: yup.string().min(10).required(),
    genus: yup.string().min(3).required(),
    species: yup.string().min(3).required(),
    hybridParents: yup.array().of(yup.string()),
    creation: yup.object({
        creatorName: yup.string(),
        creationYear: yup.number().positive().integer()
    }),
    colours: yup.array().of(yup.string()).required(),
    petalPattern: yup.string().required(),
    scents: yup.array().of(yup.string()).required(),
    floralGrouping: yup.string(),
    imageUrl:  yup.string().url().required(),
    distribution: yup.string().required(),
    facts: yup.array().of(yup.object({fact:yup.string()}))
})

userSchema = yup.object({
    userEmail:yup.string().email().required()
})

module.exports = {speciesSchema, userSchema}