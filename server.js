const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const { sequelize } = require('./database/models');
const path = require('path');

const app = express();
dotenv.config();
const secret_key = process.env.SECRET_KEY_APP;

// basic config 
app.use(express.urlencoded({ extended: true })); // middleware to parse urlencoded form data
app.use(express.json()); // middleware to parse JSON data
app.use(express.static(path.join(__dirname, 'public'))); // serve static files from the public directory (for CSS, JS, images, etc.)

//session config 
app.use(
    session({
        secret: secret_key,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false }, // set to true if using HTTPS (no need for secure cookies in development)
    })
);

// global vars 
app.use((req,res,next)=>{
    res.locals.user = req.session.user || null; // make user data available in all views via res.locals
    next();
});

// serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'shared', 'index.html'));
});

// auth routes
const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

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
