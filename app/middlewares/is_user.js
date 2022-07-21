module.exports = function(req, res, next) {
    if(req.user){
        if(req.user.role == "user"){
            next()
            return;
        }
    }
    res.status(401).json({status: 401, message: "Unauthorized"});
}
