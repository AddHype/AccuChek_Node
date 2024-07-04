const express = require('express');
const dotenv = require('dotenv');
const app = express();
const bodyParser = require('body-parser');
const Products = require('./models/productModel/product.model')
const multer = require('multer');
const path= require('path');
const ejs = require('ejs');

app.use(bodyParser.json());
var cors = require('cors')
dotenv.config({path:'config.env'})
require('./configuration/connection/connection')
app.use(cors());
app.use("/uploads", express.static("uploads"));
const get_Admin_routes=require("./routes/adminRoutes/admin.route")
const get_User_routes=require("./routes/userRoutes/user.route")
app.use(express.json());

app.use('/Admin',get_Admin_routes)
app.use('/User',get_User_routes)

const PORT=process.env.PORT

app.listen(PORT, (req, res)=>{
    console.log(`Server listening on Port  ${PORT}` )
})
