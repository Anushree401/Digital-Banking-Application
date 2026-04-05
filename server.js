const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const { sequelize } = require('./database/models');
const path = require('path');

const app = express();
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' data:;"
  );
  next();
}); // set csp header to allow inline scripts and styles (for development only, not recommended for production)
dotenv.config();
const secret_key = process.env.SECRET_KEY_APP;

// basic config 
app.use(express.urlencoded({ extended: true })); // middleware to parse urlencoded form data
app.use(express.json()); // middleware to parse JSON data
app.use(express.static(path.join(__dirname, 'views')));
app.use(
  '/css',
  express.static(path.join(__dirname, 'views/shared/css'))
); // serve static files from the public directory (for CSS, JS, images, etc.)
app.use(
  '/assets',
  express.static(path.join(__dirname, 'views/shared/assets'))
); // serve static files from the public directory (for CSS, JS, images, etc.)
app.use(
    '/js', 
    express.static(path.join(__dirname, 'middleware'))
); // serve static files from the public directory (for CSS, JS, images, etc.)
app.use(
    '/customer', 
    express.static(path.join(__dirname, 'views', 'customer'))
);

//session config 
app.use(
    session({
        secret: secret_key,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false, sameSite: 'lax' }, // set to true if using HTTPS (no need for secure cookies in development)
    })
);

// global vars 
app.use((req,res,next)=>{
    res.locals.user = req.session.user || null; // make user data available in all views via res.locals
    next();
});

// debug
app.use('/debug', require('./routes/debugRoutes'));

// serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'shared', 'index.html'));
});

// auth routes
app.use('/auth', require('./routes/authRoutes'));

// customer routes
app.get('/customer/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  res.sendFile(path.join(__dirname, 'views', 'customer', 'index.html'));
});
app.use('/api/accounts', require('./routes/accountRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/cards', require('./routes/cardRoutes'));
app.use('/api/loans', require('./routes/loanRoutes'));
app.use('/api/fds', require('./routes/fdRoutes'));
app.use('/api/investments', require('./routes/investmentRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.get('/loan-officer/cards', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'loan-officer', 'cards.html'));
});

// start server after db connect
sequelize.authenticate()
    .then(() => {
        console.log('Database connected successfully');
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });
