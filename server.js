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

        const{ name, email, password, role} = req.body

        try{
            if(!email){
                res.json({error: "Email is not provided."})
                return;
            }
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ error: "Invalid email format." });
            }
            
            const existingUser = await User.findOne({ email })
            if(existingUser){
                return res.status(400).json({ error: "Email already exists"})
            }

            if(!name || !password){
                res.json({error: "Either Name or Password is not provided."})
                return;
            }
            
            bcrypt.hash(password, 10, async(error, hashPassword)=>{
                if(error){
                    return res.status(500).json({ error: `Error hashing password: ${error}` });
                }
                const newUser = new User({
                    name: name, 
                    email: email, 
                    password: hashPassword,
                    role: role    
                })
                    
                await newUser.save()
                res.send("Registration Successful")
            })
        }
        catch(e){
            console.log(e.message)
            return res.json({ error: "Server Error"})
        }
        
    })

    app.get('/login', (req, res)=>{
        res.render("login")
    })

    app.post('/login',async(req, res)=>{

        const{email, password} = req.body;
        try{

            const user = await User.findOne({ email})
            if (!user || !bcrypt.compareSync(password, user.password)) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }

            const token = jwt.sign({user, role: user.role}, "secretkey", {expiresIn: "1h"});
            res.cookie('token', token, {
                httpOnly: true
            })
            console.log(user.role)
            if(user.role == "user"){
                res.send("User profile")
                // res.redirect("/profile");
            }
            if(user.role == "admin"){
                res.send("Admin Page Successful")
                // res.redirect(`/admin`)
            }
            if(user.role == "moderator"){
                res.send("Login Successful")
                // res.redirect(`/moderator`)
            }
        }
        catch(e){
            console.log(e.message)
            return res.status(500).json("Server Error")
        }
        
    })

    app.get('/profile',authenticate, (req, res)=>{
        res.render("profile", {name: req.user.name})
    })

    app.post('/profile', authenticate, (req,res)=>{
        res.send(`Welcome, ${req.user.name}`)
    })

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

    app.get('/logout', (req,res)=>{
        res.clearCookie('token')
        res.redirect('/login')
    })

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

    app.get('/admin', authenticate, isAdmin, (req, res) => {
        res.json({ message: 'Admin route', user: req.user });
    });


    app.get('/moderator', authenticate, isModerator, (req, res) => {
        res.json({ message: 'Moderator route', user: req.user });
    });



    app.listen(4040)