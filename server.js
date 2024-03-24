//This system will allow users to register, login, and access protected routes by utilizing JWT for secure authentication.  For the protected route, you can create a dummy route to and add authentication to it.


const express = require('express')
const app = express()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

//Making a connection to the mongoose database
const mongoose = require('mongoose')
const User = require("./user")
mongoose.connect("mongodb://localhost/user_data")


app.use(express.urlencoded({ extended: true })) //helps to understand and read form data when it's submitted from a web page.
app.use(express.json()) //  allow to parse incoming requests with JSON payloads.
app.use(cookieParser()) // parses cookies (req.cookies), making them accessible in our route handlers

 //app.set('key', 'value')
app.set('view engine', 'ejs') // allows to render ejs file

app.get('/', (req, res)=>{
    res.render('home')
})

app.get('/register', (req, res)=>{
    res.render('register')
})
app.post('/register',async(req,res)=>{

    const{ name, email, password} = req.body

    try{
        
        const existingUser = await User.findOne({ email })
        if(existingUser){
            return res.status(400).json({ error: "Email already exists"})
        }

        bcrypt.hash(password, 10, async(error, hashPassword)=>{
            if(error){
                return res.status(500).json({ error: `Error hashing password: ${error}` });
            }
            const newUser = new User({ 
                name: name, 
                email: email, 
                password: hashPassword })
                
            await newUser.save()
            res.send("Registration Successful")
        })
        
    }
    catch(e){
        console.log(e.message)
    }
    
})

app.get('/login', (req, res)=>{
    res.render('login')
})

app.post('/login',(req, res)=>{

    const{email, password} = req.body;
    const user = users.find(user => user.email === email)
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const token = jwt.sign({user: user.name}, "secretkey", {expiresIn: "1h"});

    res.cookie('token', token, {
        httpOnly: true
    })

    res.send("Login Successful")
    res.redirect(`/profile`)
})

app.get('/profile',authenticate, (req, res)=>{
    res.render("profile", {name: req.user})
})

function authenticate(req,res,next){
    const token = req.cookies.token
    
    if(!token){
        return res.status(401).json({error: 'No tokens provided'})
    }

    const verified = jwt.verify(token, "secretkey")
    req.user = verified.user;
    
    next()
}

app.get('/logout', (req,res)=>{
    res.clearCookie('token')
    res.redirect('/login')
})


app.listen(4040)