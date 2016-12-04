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
var MONGODB_URI = process.env.MONGOLAB_URI;

router.set('view engine', 'pug');
router.set('views', path.join(__dirname, 'views'));


//-------------------------Database Stuff
//var url = `${MONGODB_URI}`;


//------------------------------Middleware
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));


//-----------------------------Routes

router.get(('/'),function(req,res) {
  res.render('view');
});


router.get('/:input(*)', function(req, res){
    // Regex from https://gist.github.com/dperini/729294
    var regex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
    if(!regex.test(req.params.input) && req.params.input.length !== 4) {
        console.log("not a valid url");
        res.json({invalid: "Not a valid url"});
        return;
    }
    
    
    
    MongoClient.connect(MONGODB_URI, function(err, db) {
      
       if(err) console.log(err);
       if(req.params.input.length === 4) {
           db.collection('urlStorage').findOne({"id": Number(req.params.input)}, function(err, doc) {
               if(err) {
                   console.log(err);
                   res.json({url: "URL doesn't exist."});
                   db.close();
                   return;
               } else {
                   if(doc===null) {
                       db.close();
                       res.json({search_error: "URL doesn't exist."});
                       return;
                   }
                res.redirect(doc.url);
               }
           });
           db.close();
          return;
       }
        db.collection('urlStorage').findOne({"url": req.params.input}, function(err, doc) {
            if(err)  {
                console.log(err);
                res.json({database_error: "Please try again."});
            }
            
        if (doc) {
            console.log("already exists!");
         //res.json({url: "localhost/" + doc.id, old: req.params.input});
         return res.redirect(doc.url);

        }
        else {
            console.log("doesn't exist!");
           var collection = db.collection('urlStorage');
           var url = {id: Math.floor(Math.random()*(10000-1000+1)+1000) , url: req.params.input};
           collection.insert(url, function(err,result) {
               
               if(err) console.log(err);
               else {
                   res.json({url: "https://url-shortener-zbennett10.c9users.io/" + result.ops[0].id.toString(), old: req.params.input});
                   console.log(result);
                   db.close();
               }
           });
        }
        });
      
    });
    
    
});



module.exports = router;
