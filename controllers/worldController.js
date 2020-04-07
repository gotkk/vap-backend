const { poolPromise, sql } = require('../models/db');

module.exports = {
    getWorldFromName: async (req, res, _next) => {
        const { name } = req.params;
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('NameCountry', sql.Char, name)
                .query('select Name, geom.MakeValid().STArea() AS Area from World where NAME = @NameCountry');
            res.json(result.recordset);
        } catch (err) {
            res.status(500);
            res.send(err.message);
        }
    }
}