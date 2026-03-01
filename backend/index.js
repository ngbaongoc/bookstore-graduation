const express = require('express')
const app = express()
const mongoose = require('mongoose');
const port = 3000
const cors = require ('cors');
require('dotenv').config()

//Middleware
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}))

// Route
const bookRoutes = require ('./serc/books/book.route')
app.use ("/api/books",bookRoutes)

async function main() {
    await mongoose.connect(process.env.DB_URL);
}

main().then(() => console.log("MongoDB connected successfully!")).catch(err => console.log(err));

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
