const fs = require("fs");
const xlsxFile = require("read-excel-file/node");
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
        let first_sheet_name = "";
        await xlsxFile(filepath, { getSheets: true }).then((sheets) => {
          first_sheet_name = sheets[0].name;
        });
        try {
          const pool = await poolPromise;
          // insert AirPollutionPM25
          result = await pool
            .request()
            .input("Sheet", sql.Char, first_sheet_name).query(`
            INSERT INTO AirPollutionPM25(country, city, Year, pm25, latitude, longitude, 
            population, wbinc16_text, Region, conc_pm25, color_pm25) 
            SELECT * FROM OPENROWSET('Microsoft.ACE.OLEDB.12.0', 
            'Excel 12.0;Database=${process.cwd()}\\uploads\\${excel.name}', 
            [${first_sheet_name}$])
          `);

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
      // await pool
      //   .request()
      //   .query("ALTER TABLE AirPollutionPM25 ADD Geom GEOMETRY");

      // update AirPollutionPM25 Geom
      const result = await pool.request().query(
        `DECLARE @geom GEOMETRY;
        UPDATE  AirPollutionPM25
        SET     Geom = geometry::STGeomFromText(CONCAT('POINT (', longitude, ' ', latitude, ')'), 4326)`
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
  getInsertTemplate: async (_req, res, _next) => {
    try {
      const InsertTemplate = `${process.cwd()}\\downloads\\template\\InsertTemplate.xlsx`;
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=InsertTemplate.xlsx"
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.download(InsertTemplate, "InsertTemplate.xlsx");
    } catch (err) {
      res.status(500).json({
        status: false,
        message: err.message,
        result: { ...err },
      });
    }
  },
  getAvgPm25ByCountry: async (_req, res, _next) => {
    try {
      const AvgPm25ByCountry = `${process.cwd()}\\downloads\\resource\\AvgPm25ByCountry.xls`;
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=InsertTemplate.xlsx"
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.ms-excel"
      );

      res.download(AvgPm25ByCountry, "AvgPm25ByCountry.xls");
    } catch (err) {
      res.status(500).json({
        status: false,
        message: err.message,
        result: { ...err },
      });
    }
  },
  getCountryAndCityPMthan50: async (_req, res, _next) => {
    try {
      const CountryAndCityPMthan50 = `${process.cwd()}\\downloads\\resource\\CountryAndCityPMthan50.xls`;
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=InsertTemplate.xlsx"
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.ms-excel"
      );

      res.download(CountryAndCityPMthan50, "CountryAndCityPMthan50.xls");
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
  getHistoryPM25byCountry: async (req, res, _next) => {
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
  getTotalPopulationbyYearandColorPM25: async (req, res, _next) => {
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
  getAllCityPointAllCountrybyYear: async (req, res, _next) => {
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
  get50ClosestBangkok: async (_req, res, _next) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
          DECLARE @Bangkok GEOMETRY
          SELECT @Bangkok = Geom
          FROM AirPollutionPM25
          WHERE city='Bangkok'
          SELECT TOP 50 country, city, latitude, longitude, color_pm25, Geom.MakeValid().STDistance(@Bangkok) AS Distance
          FROM AirPollutionPM25
          WHERE city != 'Bangkok'
          ORDER BY Distance ASC
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
  getNeighborThailand: async (_req, res, _next) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
          DECLARE @Thailand GEOMETRY
          SELECT @Thailand = Geom
          FROM world
          WHERE NAME='Thailand'
          
          DECLARE @Neighbor TABLE(country NVARCHAR(255))
          INSERT INTO @Neighbor 
          SELECT NAME
          FROM world
          WHERE NAME != 'Thailand' AND (geom.MakeValid().STTouches(@Thailand)) = 1
          
          SELECT p.country, p.city,p.latitude, p.longitude, p.color_pm25
          FROM AirPollutionPM25 AS p, @neighbor AS n
          WHERE p.country = n.country 
          AND p.Year=2018
        `);
      const result_all = await pool.request().query(`
          DECLARE @Thailand GEOMETRY
          SELECT @Thailand = Geom
          FROM world
          WHERE NAME='Thailand'
          
          DECLARE @Neighbor TABLE(country NVARCHAR(255))
          INSERT INTO @Neighbor 
          SELECT NAME
          FROM world
          WHERE NAME != 'Thailand' AND (geom.MakeValid().STTouches(@Thailand)) = 1
          
          SELECT p.country, p.city,p.latitude, p.longitude, p.color_pm25
          FROM AirPollutionPM25 AS p, @neighbor AS n
          WHERE p.country = n.country 
        `);
      res.status(200).json({
        status: true,
        result: result.recordsets,
        result_all: result_all.recordsets,
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: err.message,
        result: { ...err },
      });
    }
  },
  getMinMaxLatLnThaiForMBR: async (_req, res, _next) => {
    try {
      const pool = await poolPromise;
      const mbrresult = await pool.request().query(`
          SELECT MAX(latitude) AS MaxLat, MIN(latitude) AS MinLat, MAX(longitude) AS MaxLn, MIN(longitude) AS MinLn
          FROM AirPollutionPM25
          WHERE country='Thailand'
          AND Year=2009
        `);
      const pmresult = await pool.request().query(`
          SELECT city, latitude, longitude, color_pm25
          FROM AirPollutionPM25
          WHERE country='Thailand'
          AND Year=2009
        `);
      const mbrresult_all = await pool.request().query(`
          SELECT MAX(latitude) AS MaxLat, MIN(latitude) AS MinLat, MAX(longitude) AS MaxLn, MIN(longitude) AS MinLn
          FROM AirPollutionPM25
          WHERE country='Thailand'
        `);
      const pmresult_all = await pool.request().query(`
          SELECT city, latitude, longitude, color_pm25
          FROM AirPollutionPM25
          WHERE country='Thailand'
        `);

      let mbrpoint = [];
      let pmpoint = [];
      let ring = [];
      let mbrpoint_all = [];
      let pmpoint_all = [];
      let ring_all = [];

      if (
        mbrresult &&
        mbrresult.recordsets.length > 0 &&
        mbrresult.recordsets[0].length > 0
      ) {
        let { MaxLat, MinLat, MaxLn, MinLn } = mbrresult.recordsets[0][0];
        mbrpoint = [
          {
            latitude: MinLat,
            longitude: MaxLn,
            color_pm25: "defalut",
          },
          {
            latitude: MaxLat,
            longitude: MaxLn,
            color_pm25: "defalut",
          },
          {
            latitude: MaxLat,
            longitude: MinLn,
            color_pm25: "defalut",
          },
          {
            latitude: MinLat,
            longitude: MinLn,
            color_pm25: "defalut",
          },
        ];
        ring = [
          [MaxLn, MinLat],
          [MaxLn, MaxLat],
          [MinLn, MaxLat],
          [MinLn, MinLat],
          [MaxLn, MinLat],
        ];
      }
      if (pmresult && pmresult.recordsets.length > 0) {
        pmpoint = [...pmresult.recordsets[0]];
      }

      if (
        mbrresult_all &&
        mbrresult_all.recordsets.length > 0 &&
        mbrresult_all.recordsets[0].length > 0
      ) {
        let { MaxLat, MinLat, MaxLn, MinLn } = mbrresult_all.recordsets[0][0];
        mbrpoint_all = [
          {
            latitude: MinLat,
            longitude: MaxLn,
            color_pm25: "defalut",
          },
          {
            latitude: MaxLat,
            longitude: MaxLn,
            color_pm25: "defalut",
          },
          {
            latitude: MaxLat,
            longitude: MinLn,
            color_pm25: "defalut",
          },
          {
            latitude: MinLat,
            longitude: MinLn,
            color_pm25: "defalut",
          },
        ];
        ring_all = [
          [MaxLn, MinLat],
          [MaxLn, MaxLat],
          [MinLn, MaxLat],
          [MinLn, MinLat],
          [MaxLn, MinLat],
        ];
      }
      if (pmresult_all && pmresult_all.recordsets.length > 0) {
        pmpoint_all = [...pmresult_all.recordsets[0]];
      }

      res.status(200).json({
        status: true,
        result: {
          pmpoint: [...pmpoint],
          mbrpoint: [...mbrpoint],
          ring: [...ring],
        },
        result_all: {
          pmpoint: [...pmpoint_all],
          mbrpoint: [...mbrpoint_all],
          ring: [...ring_all],
        },
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: err.message,
        result: { ...err },
      });
    }
  },
  getHighestPoint: async (_req, res, _next) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
          SELECT country, city, pm25, latitude, longitude, color_pm25
          FROM AirPollutionPM25 
          WHERE conc_pm25 = '>50' and year = 2011
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
  getLowIncome: async (req, res, _next) => {
    let { year } = req.params;
    try {
      const pool = await poolPromise;
      const result = await pool.request().input("Year", sql.Int, year).query(`
          SELECT country, city, Year, pm25, wbinc16_text, latitude, longitude, color_pm25
          FROM AirPollutionPM25
          WHERE wbinc16_text='Low income' AND Year=@Year
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
