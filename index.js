const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')

const  userRouter = require("./routes/user")
const { connectMongoDb } = require("./connection")


connectMongoDb("mongodb://localhost/user_data")

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())
app.set('view engine', 'ejs')

app.use("/users", userRouter)
app.listen(4040)