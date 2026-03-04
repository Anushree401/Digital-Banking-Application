const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const path = require('path');

// login routes -- get for rendering on browser, post for handling form submission
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/shared/login.html'));
});
router.post('/login', authController.loginUser);

module.exports = router;