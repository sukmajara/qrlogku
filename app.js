const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const userRoutes = require('./api/routes/user');
const mobileRoutes = require('./api/routes/mobile');
const clientRoutes = require('./api/routes/client');


mongoose.connect("mongodb://rhs:skripsirhs@skripsi-shard-00-00.wbr2j.mongodb.net:27017,skripsi-shard-00-01.wbr2j.mongodb.net:27017,skripsi-shard-00-02.wbr2j.mongodb.net:27017/Skripsi?ssl=true&replicaSet=atlas-bjg1jn-shard-0&authSource=admin&retryWrites=true&w=majority");

mongoose.Promise = global.Promise;

//npm
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
 
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

//js 

app.use('/mobile', mobileRoutes);
app.use('/user', userRoutes);
app.use('/client', clientRoutes);


//error handling
app.use((req, res, next) =>{
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500); 
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;