var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var sql = require('mssql');
var cors = require('cors');
var { dbConfig } = require('./configs');
var app = express();

// Connect mssql
// var dbConn = new sql.ConnectionPool(dbConfig);
// dbConn.connect()
//     .then(() => console.log("connection successful!"))
//     .catch((err) => console.log(err));


app.use(bodyParser.json());
app.use(cors());

app.use(express.static('./views'));

app.get('/', (_req, res, _next) => {
    res.render('index.html');
})


app.use('/world', require('./routes/world'));

module.exports = app;