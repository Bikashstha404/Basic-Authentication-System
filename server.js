//This system will allow users to register, login, and access protected routes by utilizing JWT for secure authentication.  For the protected route, you can create a dummy route to and add authentication to it.


const express = require('express')
const app = express()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')


app.use(express.urlencoded({ extended: true })) //helps to understand and read form data when it's submitted from a web page.
app.use(express.json()) //  allow to parse incoming requests with JSON payloads.
app.use(cookieParser()) // parses cookies (req.cookies), making them accessible in our route handlers

const users = [{name: "Bikash", password:"hello"}]

 //app.set('key', 'value')
app.set('view engine', 'ejs') // allows to render ejs file

app.get('/', (req, res)=>{
    res.render('home')
})

app.get('/register', (req, res)=>{
    res.render('register')
})
app.post('/register',(req,res)=>{
    // res.send(req.body)
    const name = req.body.name
    const password = req.body.password

    if(users.find(user => user.name === name)){
        return res.status(400).send("Error: User name already exists")
    }
    bcrypt.hash(password, 10, (error, hashPassword)=>{
        if(error){
            return res.status(500).send(`Error hashing password: ${error}`)
        }
        users.push({name: `${name}`, password: `${hashPassword}`})
        // res.send(hashPassword)
    })
    res.redirect("/login")
})

app.get('/login', (req, res)=>{
    res.render('login')
})

app.post('/login',(req, res)=>{
    const name = req.body.name
    const password = req.body.password
    const user = users.find(user => user.name === name)
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }
    // if(!user){
    //     return res.status(401).json({ error: 'Invalid username or password' });
    // }
    
    const token = jwt.sign({user: user.name}, "secretkey", {expiresIn: "1h"});

    res.cookie('token', token, {
        httpOnly: true
    })

    // res.redirect(`/profile?name=${name}`)
    res.redirect(`/profile`)
})

app.get('/profile',authenticate, (req, res)=>{
    // res.render("profile", {name: req.query.name})
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