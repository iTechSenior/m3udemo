var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var parser = require("m3u-parser");
var fs = require("fs");
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

var insertMongodb = function(parsedData, startTime) {
  var mongoose = require("mongoose");

  // make a connection
  mongoose.connect(
    "mongodb+srv://sageusr:uzZ0DhHsHu@cluster0-5wovq.gcp.mongodb.net/test?retryWrites=true"
  );

  // get reference to database
  var db = mongoose.connection;

  db.on("error", console.error.bind(console, "connection error:"));

  db.once("open", function() {
    console.log("Connection Successful!");

    // define Schema
    var M3uSchema = mongoose.Schema({
      tvgname: String,
      tvglogo: String,
      grouptitle: String,
      title: String,
      url: String
    });

    // compile schema to model
    var m3ufile = mongoose.model("m3ufile",M3uSchema, "m3ustore");

    m3ufile.collection.insert(parsedData, function(err, docs) {
      if (err) {
        return console.error(err);
      } else {
        console.log("Multiple documents inserted to Collection");

        console.log((Date.now()-startTime)/1000);
      }
    });
  });
};

// urls
// https://appsguru.co/graphql.m3u
// http://iptvpro.vision-new.org:8789/get.php?username=iTechSenior&password=eDNMhhPHsD&type=m3u_plus&output=ts
// http://iptvpro.vision-new.org:8789/get.php?username=iTechSenior&password=eDNMhhPHsD&type=m3u&output=ts

var http = require('http');
var URL_TO_REQUEST = "http://iptvpro.vision-new.org:8789/get.php?username=iTechSenior&password=eDNMhhPHsD&type=m3u_plus&output=ts";
var file_url = "./m3uFiles/m3ufile.m3u";
var file = fs.createWriteStream('./m3uFiles/m3ufile.m3u');
var startTime = Date.now();

// var request = http.get( URL_TO_REQUEST, function(response) {
    
//     response.pipe(file);

//     file
//       .on("finish", function() {
//         var string = fs.readFileSync(file_url, { encoding: "utf8" });
//         var parsedData = parser.parse(string);

//         insertMongodb(parsedData, startTime);
//       })
//       .on("error", function(err) {
//         // Handle errors
//         fs.unlink("file.m3u"); // Delete the file async. (But we don't check the result)
//         console.log(err);
//       });
//   }
// );

var string = fs.readFileSync("m3uFiles/test.m3u", { encoding: "utf8" });
var parsedData = parser.parse(string); 
console.log(parsedData);


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
