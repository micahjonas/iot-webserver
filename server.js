const express = require('express')
const bodyParser = require('body-parser')
const pg = require('pg')
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const compiler = webpack(webpackConfig);
const faye = require('faye');
const http= require('http');

//var connectionString = "postgres://iotuser:iotpassword@localhost/iot";
const connectionString = "postgres://localhost/iot";

var bayeux = new faye.NodeAdapter({
  mount:    '/faye',
  timeout:  45
});

var app = express();
var server = http.createServer(app);

bayeux.attach(server);

app.use(bodyParser.urlencoded({ extended: true }));


app.get('/initialdata', function(req, res) {

    var results = [];

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM ROOM_CLIMATE ORDER BY time;");

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });

    });

});


app.get('/24hours/:id', function(req, res) {

    const source = req.params.id;

    var results = [];

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM table ORDER BY time DESC LIMIT 1;");

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });

    });

});

app.get('/blabla', function(req, res){
  var test = { 'id':54, 'time':(new Date()).toISOString(), 'temperature':24, 'humidity':38, 'source':12};
  bayeux.getClient().publish('/update', test);
  res.json(test);
});

app.get('/blablu', function(req, res){
  var test = { 'id':54, 'time':(new Date()).toISOString(), 'temperature':22, 'humidity':34, 'source':12};
  bayeux.getClient().publish('/update', test);
  res.json(test);
});


app.get('/24hours/:id', function(req, res) {

    const source = req.params.id;

    var results = [];

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM ROOM_CLIMATE WHERE source = '" + source + "' AND time > now() - interval '1 day' ORDER BY time ASC;");

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });

    });

});

pg.connect(connectionString, function(err, client) {
  if(err) {
    console.log(err);
  }
  client.on('notification', function(msg) {
    const row = Object.assign({}, JSON.parse(msg.payload));
    const time = row.time;
    row.time = (new Date(time)).toISOString();
    bayeux.getClient().publish('/update', row);
    console.log(row);
  });
  var query = client.query("LISTEN table_update");
});


app.use(require("webpack-dev-middleware")(compiler, {
    noInfo: true, publicPath: webpackConfig.output.publicPath
}));
app.use(require("webpack-hot-middleware")(compiler));


server.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
