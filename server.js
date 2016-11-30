var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');

//----------------------------Configuration
var router = express();
var server = http.createServer(router);
router.set('view engine', 'pug');
router.set('views', path.join(__dirname, 'views'));


//------------------------------Middleware
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));


//-----------------------------Routes

router.get(('/'),function(req,res) {
  res.render('view');
});

router.get(('/:input'), function(req, res){
    
});


//----------------------------------Server Start
server.listen(process.env.PORT || 8080, function() {
  console.log(`Listening on port ${process.env.PORT}`);
});




