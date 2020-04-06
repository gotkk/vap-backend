require('dotenv').config();
var server = require('./app');
var port = process.env.PORT || 5000;

server.listen(port, () => {
    console.log(`this app listening on port ${port}!`);
});