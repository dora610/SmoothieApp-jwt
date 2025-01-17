const express = require('express');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const authRoute = require('./routes/authRoutes');
const smoothieRoute = require('./routes/smoothieRoute');
const cookieParser = require('cookie-parser');
const { checkUser } = require('./middlewares/authMiddleware');
const helpers = require('./util/helper');
const morgan = require('morgan');
const compression = require('compression');
const fs = require('fs');
const path = require('path');

// const port = process.env.PORT || 7777;
app.set('port', process.env.PORT || 7777);

// compression
if (app.get('env') === 'production') {
  app.use(compression());
}

// static middleware
app.use(express.static('public'));

// view engine
app.set('view engine', 'ejs');
app.use(express.json());
app.use(cookieParser());

// HTTP request logger middleware for node.js, we will take split/dual loggin approach
// log only 4xx and 5xx responses to console
const loggingStyle = app.get('env') === 'production' ? 'combined' : 'dev';
app.use(
  morgan(loggingStyle, {
    skip: function (req, res) {
      return res.statusCode < 400;
    },
  })
);
// log all requests to access.log
app.use(
  morgan('combined', {
    stream: fs.createWriteStream(path.join(__dirname, './log/morgan.log'), {
      flags: 'a',
    }),
  })
);

// connect db
mongoose
  .connect(process.env.DATABASE)
  .then(() => {
    console.log('Successfully connected to mongodb');
    // fire up server
    app.listen(app.get('port'));
  })
  .then(() =>
    console.log(
      `server is up and running at http://localhost:${app.get('port')}`
    )
  )
  .catch((err) => console.error(err));

app.use((req, res, next) => {
  res.locals.pathVal = req.path;
  res.locals.h = helpers;
  next();
});

// routes
app.all('*', checkUser);
// app.use(checkUser);

app.use(authRoute);
app.use(smoothieRoute);

// cookies
/* app.get('/set-cookies', (req, res) => {
  // res.header('Set-cookie', 'newUser=sweet');
  res.cookie('newUser', false);
  res.cookie('isEmployee', true, {
    maxAge: 1000 * 60 * 5,
    secure: true,
    httpOnly: true,
  });

  res.send('You got a cookie🍪!');
});
app.get('/read-cookies', (req, res) => {
  const cookies = req.cookies;
  console.log(cookies['newUser']);
  res.json(cookies);
});
 */
