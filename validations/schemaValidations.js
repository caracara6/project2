const yup = require('yup')

speciesSchema = yup.object({
    commonName: yup.string(),
    officialName: yup.string().required,
    genus: yup.string().required,
    species: yup.string().required,
    hybridParents: yup.array().of(
        string()
    ),
    creation: yup.object({
        creatorName: yup.string(),
        creationYear: yup.number().positive().integer()
    }),
    colours: yup.array().of(string()).required(),
    petalPattern: yup.string().required(),
    scents: yup.array().of(string()).required(),
    floralGrouping: yup.string(),
    imageUrl:  yup.string().url().required(),
    distribution: yup.string().required,
    facts: 
})

module.exports = {speciesSchema}