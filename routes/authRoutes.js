const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const path = require('path');

// login routes -- get for rendering on browser, post for handling form submission
router.get('/login', authController.showLogin);
router.post('/login', authController.loginUser);

// register routes 
router.get('/register', authController.showRegister);
router.post('/register', authController.registerUser);

// logout routes 
router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.sendStatus(200);
    });
});

module.exports = router;