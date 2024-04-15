const { User } = require("../models/user")
const key = "secretkey"
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

async function handleHomePage(req, res){
    const allDbUsers = await User.find({})
    return res.json(allDbUsers)
}

async function handleRegistrationPage(req, res){
    return res.send("Welcome to the Registration Page.")
}

async function handleRegistrationData(req, res){
    const body = req.body
        if(!body ||
        !body. name ||
        !body.email ||
        !body.password){
            return res.status(400).json({msg: "All fields must be provided."})
        }
        
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(body.email)) {
            return res.status(400).json({ error: "Invalid email format." });
        }

        const existingUser = await User.findOne({ email: body.email });
        if (existingUser) {
            return res.status(400).json({ msg: "Email already exists" });
        }


        bcrypt.hash(body.password, 10, async(error, hashPassword)=>{
            if(error){
                return res.status(500).json({ error: `Error hashing password: ${error}` });
            }
            const newUser = await User.create({
                name: body.name, 
                email: body.email, 
                password: hashPassword,
                role: body.role    
            })
           
            return res.status(201).json({msg: "Registration Succesfull", id: newUser._id})
        })
}

async function handleLoginPage(req, res){
    return res.send("Welcome to the login page.")
}

async function handleLoginProcess(req, res){
    const body = req.body
    const user = await User.findOne({email: body.email})

    if (!user || !bcrypt.compareSync(body.password, user.password)) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }   
    
    const token = jwt.sign({user, role: user.role}, key , {expiresIn: "1h"});
    res.cookie('token', token, {
        httpOnly: true
    })
    
    if(user.role == "user"){
        return res.send("Welcome to you profile page.")
    }
    if(user.role == "admin"){
        return res.send("Welcome to the admin page.")
        // res.redirect(`/admin`)
    }
    if(user.role == "moderator"){
        return res.send("Welcome to the moderator page.")
        // res.redirect(`/moderator`)
    }
}

async function handleProfilePage(req, res){
    return res.send("Welcome to the profile.")
}

async function handleAdminRoute(req, res){
    return res.json({ message: 'Admin route', user: req.user });
}

async function handleModeratorRoute(req, res){
    return res.json({ message: 'Moderator route', user: req.user });
}

async function handleLogOut(req, res){
    res.clearCookie('token')
    res.redirect('/login')
}


module.exports = {
    handleHomePage,
    handleRegistrationPage,
    handleRegistrationData,
    handleLoginPage,
    handleLoginProcess,
    handleProfilePage,
    handleAdminRoute,
    handleModeratorRoute,
    handleLogOut
}