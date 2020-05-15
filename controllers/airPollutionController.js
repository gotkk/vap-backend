const fs = require("fs");
const { poolPromise, sql } = require("../models/db");

module.exports = {
  insertAirPollutionPM25: async (req, res, _next) => {
    // const { excel } = req.body;
    // try {
    //   const pool = await poolPromise;
    //   //   await pool.request().query("DROP TABLE AirPollutionPM25");
    //   const result = await pool
    //     .request()
    //     .input("PathExcel", sql.NVarChar(255), excel)
    //     .query(
    //       `INSERT INTO AirPollutionPM25 SELECT * FROM OPENROWSET('Microsoft.ACE.OLEDB.12.0',
    //         'Excel 12.0;Database=../uploads/${excel}', [WHO_AirQuality_Database_2018$])`
    //     );
    //   res.json({ rowsAffected: result.rowsAffected });
    // } catch (err) {
    //   res.status(500);
    //   res.send(err.message);
    // }

    try {
      if (!req.files) {
        res.send({
          status: false,
          message: "No file uploaded",
        });
      } else {
        const excel = req.files.excel;
        const filepath = "./uploads/" + excel.name;
        let result = {};
        excel.mv(filepath);

        try {
          const pool = await poolPromise;
          // insert AirPollutionPM25
          result = await pool.request().query(
            `INSERT INTO AirPollutionPM25 SELECT * FROM OPENROWSET('Microsoft.ACE.OLEDB.12.0', 
                'Excel 12.0;Database=${process.cwd()}\\uploads\\${excel.name}', 
                [WHO_AirQuality_Database_2018$])`
          );

          fs.unlink(`./uploads/${excel.name}`, (err) => {
            if (err) throw err;
          });
        } catch (err) {
          res.status(500);
          res.send(err.message);
        }

        res.send({
          status: true,
          message: "File is uploaded",
          data: {
            name: excel.name,
            mimetype: excel.mimetype,
            size: excel.size,
          },
          insert_result: { ...result },
        });
      }
    } catch (err) {
      res.status(500);
      res.send(err);
    }
  },
  addGeomColumnAirPollutionPM25: async (req, res, _next) => {
    try {
      const pool = await poolPromise;
      // alter table AirPollutionPM25 add Geom
      await pool
        .request()
        .query("ALTER TABLE AirPollutionPM25 ADD Geom GEOMETRY");

      // update AirPollutionPM25 Geom
      const result = await pool.request().query(
        `DECLARE @geom GEOMETRY;
        UPDATE  AirPollutionPM25
        SET     Geom = geometry::STGeomFromText(CONCAT('POINT (', longitude, ' ', latitude, ')'), 0)`
      );

      res.send({
        status: true,
        message: "AirPollutionPM25 is updated",
        result: { ...result },
      });
    } catch (err) {
      res.status(500);
      res.send(err.message);
    }
  },
  dropGeomColumnAirPollutionPM25: async (req, res, _next) => {
    try {
      const pool = await poolPromise;
      // alter table AirPollutionPM25 drop Geom
      const result = await pool
        .request()
        .query("ALTER TABLE AirPollutionPM25 DROP COLUMN Geom");

      res.send({
        status: true,
        message: "AirPollutionPM25 is updated",
        result: { ...result },
      });
    } catch (err) {
      res.status(500);
      res.send(err.message);
    }
  },
};
