var express = require('express'),
app = express();

app.use(express.static(__dirname + '/app'));

app.listen(8888);

console.log("http://localhost:8888");