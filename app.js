var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
/* var mysql = require('mysql'); */
var Registration = require('./models/registrationModel');
var Teacher = require('./models/teacherModel');
var Student = require('./models/studentModel');

var apiRouter = require('./routes/api');

var app = express();

// view engine setup
/* app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade'); */

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Create object for each model
const registration = {Registration};
const teacher = {Teacher};
const student = {Student};

app.use('/api', apiRouter(registration, teacher, student));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  /* res.locals.message = err.message; */
  res.locals.error = req.app.get('env') === 'development' ? err : {}; 
  // render the error page
  res.status(err.status || 500);
  
  console.log(res.locals.error);
  res.json({"Status": "Fail", "Message": err.message})
});

//Database connection
/* app.use(function(req, res, next){
	res.locals.connection = mysql.createConnection({
		host     : 'localhost',
		user     : 'root',
		password : ' ',
		database : 'express'
	});
	res.locals.connect();
	next();
}); */

module.exports = app;
