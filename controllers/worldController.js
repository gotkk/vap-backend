const { poolPromise, sql } = require('../db');

module.exports = {
    getWorldFromName: async (req, res, _next) => {
        const { name } = req.params;
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('Namec', sql.Char, name)
                .query('select * from World where NAME = @Namec')
            res.json(result.recordset);
        } catch (err) {
            res.status(500);
            res.send(err.message);
        }
    }
}