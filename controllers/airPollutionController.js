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
        res.status(200).json({
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
          fs.unlink(`./uploads/${excel.name}`, (err) => {
            if (err) throw err;
          });
          res.status(500).json({
            status: false,
            message: err.message,
            result: { ...err },
          });
        }

        res.status(200).json({
          status: true,
          message: "This File is uploaded and inserted",
          data: {
            name: excel.name,
            mimetype: excel.mimetype,
            size: excel.size,
          },
          insert_result: { ...result },
        });
      }
    } catch (err) {
      res.status(500).json({
        status: false,
        message: err.message,
        result: { ...err },
      });
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

      res.status(200).json({
        status: true,
        message: "AirPollutionPM25 is updated",
        result: { ...result },
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: err.message,
        result: { ...err },
      });
    }
  },
  clearAirPollutionPM25: async (_req, res, _next) => {
    try {
      const pool = await poolPromise;
      await pool.request().query("DROP TABLE AirPollutionPM25");
      const result = await pool.request().query(
        `CREATE TABLE AirPollutionPM25
      (
          country NVARCHAR(100),
          city NVARCHAR(100),
          Year INTEGER,
          pm25 FLOAT,
          latitude FLOAT,
          longitude FLOAT,
          population FLOAT,
          wbinc16_text NVARCHAR(100),
          Region NVARCHAR(100),
          conc_pm25 NVARCHAR(40),
          color_pm25 NVARCHAR(40),
          PRIMARY KEY(city,Year, pm25)
      )`
      );
      res.status(200).json({
        status: true,
        message: "AirPollutionPM25 is Cleared and Creaded",
        result: { ...result },
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: err.message,
        result: { ...err },
      });
    }
  },
  getHistoryPM25byCountry: async (req, res, next) => {
    const { country } = req.params;
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("Country", sql.Char, country)
        .query(
          `SELECT country, city, Year, pm25
      FROM AirPollutionPM25
      WHERE country=@Country
      ORDER BY Year ASC, City ASC`
        );
      res.status(200).json({
        status: true,
        result: result.recordsets,
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: err.message,
        result: { ...err },
      });
    }
  },
  getTotalPopulationbyYearandColorPM25: async (req, res, next) => {
    const { year, colorpm25 } = req.body;
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("Year", sql.Int, year)
        .input("ColorPM25", sql.Char, colorpm25).query(`
          SELECT Year, color_pm25, SUM(population) AS 'total_population'
          FROM AirPollutionPM25
          WHERE Year=@Year AND color_pm25=@ColorPM25
          GROUP BY Year, color_pm25
        `);
      res.status(200).json({
        status: true,
        result: result.recordsets,
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: err.message,
        result: { ...err },
      });
    }
  },
  getAllCityPointAllCountrybyYear: async (req, res, next) => {
    try {
      const { year } = req.params;
      const pool = await poolPromise;
      const result = await pool.request().input("Year", sql.Int, year).query(`
          SELECT p.country, p.city, p.Year, p.latitude, p.longitude, p.color_pm25
          FROM AirPollutionPM25 AS p
          WHERE p.Year=@year
        `);
      res.status(200).json({
        status: true,
        result: result.recordsets,
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: err.message,
        result: { ...err },
      });
    }
  },
};