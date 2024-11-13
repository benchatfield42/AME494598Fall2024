var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var methodOverride = require('method-override');
var hostname = process.env.HOSTNAME || 'localhost';
var port = 8080;
var VALUEt = 0;
var VALUEh = 0;
var VALUEtime = 0;

let MongoClient = require('mongodb').MongoClient;
const connectionString = 'mongodb://localhost:27017';

var db; // Declare a global db object to be used in routes

// Connect to the database once at the start
MongoClient.connect(connectionString, { useNewUrlParser: true })
  .then(client => {
    db = client.db('sensorData'); // Use your actual database name here
    console.log("Connected to MongoDB");
  })
  .catch(err => console.error(err));

app.get("/", function (req, res) {
    res.redirect("/index.html");
});

app.get("/getAverage", function (req, res) {
  var from = parseInt(req.query.from);
  var to = parseInt(req.query.to);

  // Fetch records between 'from' and 'to' times
  db.collection("data").find({time:{$gt:from, $lt:to}}).toArray(function(err, result){
    if (err) {
      res.status(500).send("Error fetching data.");
      return;
    }

    var tempSum = 0;
    var humSum = 0;

    // Loop through the result and calculate sums
    for (var i = 0; i < result.length; i++) {
      tempSum += result[i].t || 0;
      humSum += result[i].h || 0;  // Fix: sum humidity, not temperature
    }

    var tAvg = tempSum / result.length;
    var hAvg = humSum / result.length;

    // Return the average temperature and humidity
    res.send({ temperatureAvg: tAvg, humidityAvg: hAvg });
  });
});

app.get("/getLatest", function (req, res) {
  (async function() {
    let client = await MongoClient.connect(connectionString, { useNewUrlParser: true });
    let db = client.db('sensorData');
    try {
      let result = await db.collection("data").find().sort({time: -1}).limit(10).toArray();
      res.send(JSON.stringify(result));
    }
    finally {
      client.close();
    }
  })().catch(err => console.error(err));
});

// Fetch data for a specific time range
app.get("/getData", function (req, res) {
  var from = parseInt(req.query.from);
  var to = parseInt(req.query.to);

  // Fetch data based on the time range specified by 'from' and 'to'
  db.collection("data").find({time:{$gt:from, $lt:to}}).sort({time: -1}).toArray(function(err, result){
    if (err) {
      res.status(500).send("Error fetching data.");
      return;
    }
    res.send(JSON.stringify(result));
  });
});

app.get("/getValue", function (req, res) {
  res.send(VALUEt.toString() + " " + VALUEh + " " + VALUEtime + "\r");
});

app.get("/setValue", function (req, res) {
  VALUEt = parseFloat(req.query.t);
  VALUEh = parseFloat(req.query.h);
  VALUEtime = new Date().getTime();

  var dataObj = {
    t: VALUEt,
    h: VALUEh,
    time: VALUEtime
  };

  res.send(VALUEtime.toString());

  (async function() {
    let client = await MongoClient.connect(connectionString, { useNewUrlParser: true });
    let db = client.db('sensorData');
    try {
      let result = await db.collection("data").insertOne(dataObj);
      if(result.insertedId) {
        console.log(result.insertedId.toString());
      }
    }
    finally {
      client.close();
    }
  })().catch(err => console.error(err));
});

app.use(methodOverride());
app.use(bodyParser());
app.use(express.static(__dirname + '/public'));
app.use(errorHandler());

console.log("Simple static server listening at http://" + hostname + ":" + port);
app.listen(port);
