const express = require('express');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const authRoute = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const { requireAuth, chechUser } = require('./middlewares/authMiddleware');

const port = process.env.PORT || 7777;

// static middleware
app.use(express.static('public'));
// view engine
app.set('view engine', 'ejs');
app.use(express.json());
app.use(cookieParser());

// connect db
mongoose
  .connect(process.env.DATABASE)
  .then(() => {
    console.log('Successfully connected to mongodb');
    // fire up server
    app.listen(port);
  })
  .then(() =>
    console.log(`server is up and running at http://localhost:${port}`)
  )
  .catch((err) => console.error(err));

// routes
app.get('*', chechUser);
app.get('/', (req, res) => {
  res.render('home');
});
app.get('/smoothies', requireAuth, (req, res) => {
  let smoothies = [
    { name: 'Banana Boost', ingrdt: ['Banana', 'Vanilla ice cream', 'Milk'] },
    { name: 'Tropical Twist', ingrdt: ['Peach', 'Pinapple', 'Apple juice'] },
    {
      name: 'Protein Packer',
      ingrdt: ['Oats', 'Peanut butter', 'Mil', 'Banana', 'Blueberries'],
    },
  ];
  res.render('smoothies', { smoothies: [...smoothies, ...smoothies] });
});
app.use(authRoute);

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
