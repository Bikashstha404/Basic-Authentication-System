const jwt = require('jsonwebtoken')

function authenticate(req,res,next){
    const token = req.cookies.token    
    if(!token){
        return res.status(401).json({error: 'No tokens provided'})
    }

    const verified = jwt.verify(token, "secretkey")
    req.user = verified.user;
    req.role = verified.role;
    
    next()
}

function isAdmin(req, res, next){
    res.send(req.role)
    if(req.user.role != "admin"){
        return res.status(403).json({error: 'Admin access required.'})
    }
    next()
}

function isModerator(req, res, next){
    if(req.user.role != "moderator"){
        return res.status(403).json({error: 'Moderator access required.'})
    }
    next()
}

module.exports = {
    authenticate, 
    isAdmin,
    isModerator
}