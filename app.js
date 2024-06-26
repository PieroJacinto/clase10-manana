var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// instalamos session
const session = require("express-session")

var indexRouter = require('./routes/index');
const moviesRouter = require('./routes/movies');
const registerRouter = require('./routes/register');
const loginRouter = require('./routes/login');
const db = require('./database/models');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Aca "usamos" session 
app.use(session(
  {
    secret: "los gatitos son lo mejor",
    resave: false,
    saveUninitialized: true
  }
))

// Antes de las rutas. Dejar disponible datos de sessión para todas las vistas
app.use(function(req,res,next){
  console.log("esn session middleware");
  //console.log(req.session.user)
  if(req.session.user != undefined){
    res.locals.user = req.session.user;
    console.log("entre en locals")
    console.log(res.locals)
    return next()
  }
  return next()
})

app.use(function(req,res,next){
  //esto solo si tengo una cookie
  if(req.cookies.userId != undefined && req.session.user == undefined){
    let idDeLaCookie = req.cookies.userId;

    db.User.findByPk(idDeLaCookie)
    .then( function(user){
      console.log("middleare de la cookie trasladando info")
      req.session.user = user
      console.log("en la cookie middleware")
      res.locals.user = user;
      return next()
    })    
    .catch(function(err){
      console.log("error en cookies", err)
    })
  } else {
    return next()
  }
})

app.use('/', indexRouter);
app.use('/movies', moviesRouter);
app.use('/register', registerRouter);
app.use('/login', loginRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

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
