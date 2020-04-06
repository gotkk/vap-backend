const sql = require('mssql')
const { dbConfig } = require('./configs');

const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        return pool
    })
    .catch(err => console.log('Database Connection Failed! Bad Config: ', err))

module.exports = {
    sql, poolPromise
}