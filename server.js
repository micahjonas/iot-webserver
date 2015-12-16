const express = require('express')
const bodyParser = require('body-parser')
const pg = require('pg')
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const compiler = webpack(webpackConfig);
const faye = require('faye');
const http= require('http');

//const connectionString = "postgres://iotuser:iotpassword@localhost/iot";
const connectionString = "postgres://localhost/iot";

var bayeux = new faye.NodeAdapter({
  mount:    '/faye',
  timeout:  45
});

var app = express();
var server = http.createServer(app);

bayeux.attach(server);

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/sensors', function(req, res){
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
      var query = client.query("SELECT DISTINCT source FROM ROOM_CLIMATE");

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
        var query = client.query("SELECT source, json_agg( json_build_object('id', id, 'temperature', temperature, 'humidity', humidity , 'airquality',airquality,'time', time) order by time) AS data FROM ROOM_CLIMATE WHERE time > current_date - interval '36' hour GROUP  BY source;");

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


app.get('/getsound', function(req, res) {

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
      var query = client.query("SELECT source, json_agg( json_build_object('id', id, 'soundlevel', soundlevel, 'source', source, 'time', time) order by time) AS data FROM ROOM_SOUND WHERE current_timestamp - interval '2 hour' <= time and soundlevel < 10000 GROUP  BY source;");

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
    bayeux.getClient().publish('/update_sound', row);
    console.log(row);
  });
  var query = client.query("LISTEN table_sound_update");
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
