
const pg = require('pg')



const connectionString = "postgres://localhost/iot";

var results = [];

var client = new pg.Client(connectionString);
client.connect(function(err) {
  if(err) {
    return console.error('could not connect to postgres', err);
  }
  client.query("SELECT source, json_agg( json_build_object('id', id, 'soundlevel', soundlevel, 'source', source, 'time', time) order by time) AS data FROM ROOM_SOUND WHERE current_timestamp - interval '1 hour' <= time GROUP  BY source;", function(err, result) {
    if(err) {
      return console.error('error running query', err);
    }
    console.log(result.rows[1])
    var counter = 0;
    result.rows[0].data.forEach(function(item){
      counter++;
      console.log('11', item.id, item.time);
    })
    result.rows[1].data.forEach(function(item){
      counter++;
      console.log(item.source, item.id, item.time);
    })
    console.log('total: ', counter);
    client.end();
  });
});
