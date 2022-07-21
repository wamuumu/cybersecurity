module.exports = function(req, res, next) {
    if(req.user){
        next()
        return
    } else 
        res.status(401).json({status: 401, message: "Unauthorized"})
}