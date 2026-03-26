const express = require('express')
const app = express()
const mongoose = require('mongoose');
const port = process.env.PORT || 5000
const cors = require('cors');
const path = require('path');
const uploadRouter = require('./upload');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

//Middleware
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}))

// Route
const bookRoutes = require('./src/books/book.route')
const orderRoutes = require('./src/orders/order.route')
const userRoutes = require('./src/users/user.route')
const adminRoutes = require('./src/admins/admin.route')
const reviewRoutes = require('./src/reviews/review.route')
const blogRoutes = require('./src/blogs/blog.route')
const inventoryRoutes = require('./src/inventory/inventory.route')
const initAbandonedCartCron = require('./src/orders/orderCron')
app.use("/api/books", bookRoutes)
app.use("/api", uploadRouter)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/api/orders", orderRoutes)
app.use("/api/users", userRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/blogs", blogRoutes)
app.use("/api/inventory", inventoryRoutes)

initAbandonedCartCron();

async function main() {
    await mongoose.connect(process.env.DB_URL);
    app.get("/", (req, res) => {
        res.send("Bookstore Server is running!")
    });
}

main().then(() => console.log("MongoDB connected successfully!")).catch(err => console.log(err));

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
