const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const { sequelize } = require('./database/models');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const passport = require('./config/passport');

sequelize.sync({ alter: true });

const app = express();
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
  '/middleware',
  express.static(path.join(__dirname, 'middleware'))
);
app.use(
  '/customer', 
  express.static(path.join(__dirname, 'views', 'customer'))
);

app.use(
    '/investor', 
    express.static(path.join(__dirname, 'views', 'investor'))
);

app.use(
    '/loan-officer/css', 
    express.static(path.join(__dirname, 'views', 'loan-officer', 'css'))
);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Digital Banking API',
      version: '1.0.0',
      description: 'API documentation for your banking system',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./routes/*.js'], // VERY IMPORTANT
};

const swaggerSpec = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

function requireAuthenticatedLoanOfficer(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  if (req.session.user.role !== 'loan_officer') {
    return res.redirect('/auth/login');
  }

  next();
}

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
  res.redirect('/shared/index.html');
});

app.use(passport.initialize());
app.use(passport.session());

const helmet = require('helmet');

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://accounts.google.com",
        "https://apis.google.com"
      ],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: [
        "'self'",
        "data:",
        "https://*.googleusercontent.com"
      ],
      connectSrc: [
        "'self'",
        "https://accounts.google.com"
      ],
      frameSrc: [
        "'self'",
        "https://accounts.google.com"
      ]
    },
  })
);

// auth routes
app.use('/auth', require('./routes/authRoutes'));

// customer routes
app.get('/customer/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  res.sendFile(path.join(__dirname, 'views', 'customer', 'index.html'));
});

// investor routes
app.get('/investor/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  res.sendFile(path.join(__dirname, 'views', 'investor', 'index.html'));
});

// loan officer routes - generalized catch-all for all pages
app.get(['/loan-officer', '/loan-officer/'], requireAuthenticatedLoanOfficer, (req, res) => {
  res.redirect('/loan-officer/index.html');
});

app.get('/loan-officer/index.html', requireAuthenticatedLoanOfficer, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'loan-officer', 'index.html'));
});

app.get('/loan-officer/applications.html', requireAuthenticatedLoanOfficer, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'loan-officer', 'applications.html'));
});

app.get('/loan-officer/kyc.html', requireAuthenticatedLoanOfficer, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'loan-officer', 'kyc.html'));
});

app.get('/loan-officer/customer.html', requireAuthenticatedLoanOfficer, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'loan-officer', 'customer.html'));
});

app.get('/loan-officer/cards.html', requireAuthenticatedLoanOfficer, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'loan-officer', 'cards.html'));
});

app.get('/loan-officer/:page', requireAuthenticatedLoanOfficer, (req, res, next) => {
  const pageMap = {
    index: 'index.html',
    applications: 'applications.html',
    kyc: 'kyc.html',
    customer: 'customer.html',
    cards: 'cards.html'
  };

  const fileName = pageMap[req.params.page];

  if (!fileName) {
    return next();
  }

  res.sendFile(path.join(__dirname, 'views', 'loan-officer', fileName));
});

// Alternative underscore route (for backward compatibility)
app.get('/loan_officer/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  res.redirect('/loan-officer/index.html');
});

// API routes
app.use('/api/accounts', require('./routes/accountRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/cards', require('./routes/cardRoutes'));
app.use('/api/loans', require('./routes/loanRoutes'));
app.use('/api/fds', require('./routes/fdRoutes'));
app.use('/api/investments', require('./routes/investmentRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

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
