var express = require('express');
var bodyParser = require('body-parser');
var sql = require('mssql');
// var cors = require('cors');
var { dbConfig } = require('./configs');
var app = express();

//Initializing connection string


// Connect mssql
// var dbConn = new sql.ConnectionPool(dbConfig);
// dbConn.connect()
//     .then(() => console.log("connection successful!"))
//     .catch((err) => console.log(err));


app.use(bodyParser.json());
// app.use(cors());

app.get('/', (_req, res, _next) => {
    res.send('this is spdb-backend application');
})


app.use('/world', require('./routes/world'));

module.exports = app;