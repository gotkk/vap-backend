var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");
var sql = require("mssql");
const fs = require("fs");
var cors = require("cors");
const fileUpload = require("express-fileupload");
var { dbConfig } = require("./configs");
var app = express();

// Connect mssql
// var dbConn = new sql.ConnectionPool(dbConfig);
// dbConn.connect()
//     .then(() => console.log("connection successful!"))
//     .catch((err) => console.log(err));

app.use(bodyParser.json());
app.use(cors());
app.use(
  fileUpload({
    createParentPath: true,
  })
);

app.use(express.static("./views"));

app.get("/", (_req, res, _next) => {
  res.render("index.html");
});

app.use("/world", require("./routes/world"));
app.use("/airpollution", require("./routes/airPollution"));

app.post("/upload", async (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: "No file uploaded",
      });
    } else {
      //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
      let excel = req.files.excel;

      //Use the mv() method to place the file in upload directory (i.e. "uploads")
      excel.mv("./uploads/" + excel.name);
      //send response

      setTimeout(() => {
        fs.unlink(`./uploads/${excel.name}`, (err) => {
          console.log(err);
        });
      }, [5000]);

      res.send({
        status: true,
        message: "File is uploaded",
        data: {
          name: excel.name, 
          mimetype: excel.mimetype,
          size: excel.size,
        },
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = app;
