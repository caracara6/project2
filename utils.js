const MongoUtil = require('./MongoUtil');
const usersCollection="users"


module.exports = { checkEmailDuplicate }



async function checkEmailDuplicate(email){
    let registeredEmail = await MongoUtil.getDB().collection(usersCollection).findOne({userEmail: email})
    return registeredEmail ? false : true;
}