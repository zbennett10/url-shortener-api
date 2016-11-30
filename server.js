var express = require('express');
var http = require('http');
var path = require('path');

//----------------------------Configuration
var router = express();
var server = http.createServer(router);

//------------------------------Middleware


//-----------------------------Routes

router.use(function(req,res) {
  
});


//----------------------------------Server Start
server.listen(process.env.PORT || 8080, function() {
  console.log(`Listening on port ${process.env.PORT}`);
});




