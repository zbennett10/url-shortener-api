var express = require('express');
var mongo = require('mongodb');
var assert = require('assert');
var path = require('path');
var bodyParser = require('body-parser');
var pug = require('pug');

//----------------------------Configuration
var MongoClient = mongo.MongoClient;
var db = mongo.Database
var router = express();
var MONGODB_URI = process.env.MONGODB_URI || process.env.MONGOHQ_URL || process.env.MONGOLAB_URI;

router.set('view engine', 'pug');
router.set('views', path.join(__dirname, 'views'));


//------------------------------Middleware
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));


//-----------------------------Routes

router.get(('/'),function(req,res) {
  res.render('view');
});

//route for url query
router.get('/:input(*)', function(req, res){
    // Regex from https://gist.github.com/dperini/729294
    var regex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;

    if(!regex.test(req.params.input) && req.params.input.length !== 4) { //if query isn't a url or is not a 4 number sequence
        console.log("not a valid url");
        res.json({request_error: "Invalid url. Please refine your request."});
        return;
    }
    
    //bug when inputting an invalid url and when inputting a 4-number sequene that is not within the db
    MongoClient.connect(MONGODB_URI, function(err, db) {  //database connection
    var collection = db.collection('urlStorage');
       if(err) dbErrorHandle(error, res);
       findExistingUrl(err,res, db);
      
        collection.findOne({"url": req.params.input}, function(err, doc) {
            if(err) dbErrorHandle(err, res);
        
        if (doc) {
            console.log("Request for an existing url has been made.");
         return res.json({url: "https://bennett-url-shortener.herokuapp.com/" + doc.id.toString(), old: req.params.input});
        } else {
            console.log("Generating new url.....");
           var url = {id: Math.floor(Math.random()*(10000-1000+1)+1000) , url: req.params.input};
           collection.insert(url, function(err,result) {
               if(err) dbErrorHandle(err, res);
               else {
                   res.json({url: "https://bennett-url-shortener.herokuapp.com/" + result.ops[0].id.toString(), old: req.params.input});
                   db.close();
               }
           });
        }
        });
      
    });
    
    
});

//if the user is trying to redirect to an existing url


//redirects the user to the existing url
function findExistingUrl(err, response, db) {
    var collection = db.collection('urlStorage');
    if(req.params.input.length === 4) { //if query is assumed to be within database
           collection.findOne({"id": Number(req.params.input)}, function(err, document) {
               if(err || document===null) { //error with seaching database
                    console.log(err);
                    response.json({database_error: "The supposed URL doesn't exist or there was a problem searching the database."}); 
                    db.close();
                    return;
                } 
            response.redirect(document.url); //redirection to url
           });
    db.close();
    return;
    }   
}

//database error handler
function dbErrorHandle(error, response) {
    console.log(error);
    response.json({database_error: "There was an error processing your request. Please try again."});
}

module.exports = router;
