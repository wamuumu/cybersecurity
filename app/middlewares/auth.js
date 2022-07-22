const User = require("../models/user")

async function hasAPIKEY(req){
    if(req.query.apikey){
        let user = await User.findOne({ apikey: req.query.apikey});
        if(user)
            return true;
    } else
        return false;   
}

module.exports = async function(req, res, next) {
    let key = await hasAPIKEY(req);
    if(req.isAuthenticated() || key){
        next()
        return
    } else {
        res.status(401).json({status: 401, message: "Unauthorized"})
    }
}