const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const path = require('path');

// login routes -- get for rendering on browser, post for handling form submission
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticates user and starts session
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       302:
 *         description: Redirects to dashboard on success
 *       400:
 *         description: Invalid credentials
 */
router.get('/login', authController.showLogin);
router.post('/login', authController.loginUser);

// register routes 
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fname:
 *                 type: string
 *               lname:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       302:
 *         description: Redirects to login page
 *       400:
 *         description: User already exists
 */
router.get('/register', authController.showRegister);
router.post('/register', authController.registerUser);

// logout routes 
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Destroys session
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.sendStatus(200);
    });
});

module.exports = router;