const express = require('express');
require('dotenv').config()
const dbConnect = require('./configs/dbconnect')
const initRoutes = require('./routes')


const app = express();
const port = process.env.PORT || 8888;
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
dbConnect()
initRoutes(app)

app.listen(port, () => {
    console.log("Sever Running: " + port)
})
