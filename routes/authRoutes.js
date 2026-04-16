const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const path = require('path');
const passport = require('passport');

function ensureGoogleOAuthConfigured(req, res, next) {
    const hasGoogleOAuthCredentials = Boolean(
        process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    );

    if (!hasGoogleOAuthCredentials) {
        return res.redirect('/auth/login?error=google_disabled');
    }

    next();
}

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

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Start Google login
 *     description: Redirects to Google login page
 *     tags:
 *       - Auth
 *     responses:
 *       302:
 *         description: Redirects to Google login page
 */
router.get('/google',
    ensureGoogleOAuthConfigured,
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google login callback
 *     description: Redirects to dashboard based on user role
 *     tags:
 *       - Auth
 *     responses:
 *       302:
 *         description: Redirects to dashboard based on user role
 */
// callback
router.get('/google/callback',
    ensureGoogleOAuthConfigured,
    passport.authenticate('google', { failureRedirect: '/auth/login?error=google' }),
    (req, res) => {

        req.session.user = {
            id: req.user.id,
            role: req.user.role
        };

        if (req.user.role === 'customer') {
            res.redirect('/customer/dashboard');
        } else if (req.user.role === 'loan_officer') {
            res.redirect('/loan_officer/dashboard');
        } else if (req.user.role === 'investor') {
            res.redirect('/investor/dashboard');
        }
    }
);

/**
 * @swagger
 * /auth/send-otp:
 *   post:
 *     summary: Sends OTP to email
 *     description: Sends a one-time password to the user's email
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
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Invalid request
 */
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    req.session.otp = otp;
    req.session.otpEmail = email;

    console.log("OTP:", otp); // TEMP (later email)

    res.json({ message: 'OTP sent' });
});

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verifies OTP
 *     description: Verifies the OTP sent to the user's email
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid OTP
 */
router.post('/verify-otp', async (req, res) => {
    const { otp, email } = req.body;

    if (
        otp === req.session.otp &&
        email === req.session.otpEmail
    ) {
        req.session.otpVerified = true;
        return res.json({ success: true });
    }

    res.status(400).json({ error: 'Invalid OTP' });
});

module.exports = router;