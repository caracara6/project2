const MongoUtil = require('./MongoUtil');
const usersCollection="users"


module.exports = { checkEmailDuplicate }



async function checkEmailDuplicate(email){
    console.log('checking duplicate email')
    await MongoUtil.connect(process.env.MONGO_URI, "tgc16_p2_orchids");
    let registeredEmail = await MongoUtil.getDB().collection(usersCollection).findOne({userEmail: email})
    return registeredEmail ? false : true;
}