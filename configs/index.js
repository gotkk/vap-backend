//Initializing connection string
var dbConfig = {
  user: process.env.DBUser,
  password: process.env.DBPassword,
  server: process.env.DBServer,
  database: process.env.DB,
  options: {
    encrypt: true,
    enableArithAbort: true,
  }
};

module.exports = {
  dbConfig,
};
