const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// login routes -- get for rendering on browser, post for handling form submission
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

module.exports = router;