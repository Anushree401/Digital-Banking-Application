const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');
const passport = require('passport');
const nodemailer = require('nodemailer');

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES || 10);

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

function hasOtpMailConfig() {
    return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

function createOtpTransporter() {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 8000
    });
}

function generateOtp() {
    const min = 10 ** (OTP_LENGTH - 1);
    const max = (10 ** OTP_LENGTH) - 1;
    return String(Math.floor(min + Math.random() * (max - min + 1)));
}

function buildOtpMessage(otp) {
    const senderName = process.env.OTP_FROM_NAME || 'BrokeBank';

    return {
        from: `"${senderName}" <${process.env.GMAIL_USER}>`,
        to: '',
        subject: `${senderName} verification code`,
        text: `Your ${senderName} verification code is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
        html: `
            <div style="font-family:Arial,sans-serif;line-height:1.5;color:#173256">
                <h2 style="margin:0 0 12px">${senderName} verification code</h2>
                <p>Your one-time password is:</p>
                <div style="font-size:28px;font-weight:700;letter-spacing:6px;margin:16px 0;padding:14px 18px;background:#eef5ff;display:inline-block;border-radius:10px;">${otp}</div>
                <p>This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>
            </div>
        `
    };
}

function ensureGoogleOAuthConfigured(req, res, next) {
    const hasGoogleOAuthCredentials = Boolean(
        process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    );

    if (!hasGoogleOAuthCredentials) {
        return res.redirect('/auth/login?error=google_disabled');
    }

    next();
}

function getDashboardPathForRole(role) {
    if (role === 'customer') {
        return '/customer/dashboard';
    }

    if (role === 'loan_officer') {
        return '/loan_officer/dashboard';
    }

    if (role === 'investor') {
        return '/investor/dashboard';
    }

    return '/auth/login';
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
router.get('/google/callback', ensureGoogleOAuthConfigured, (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
        if (err) {
            return res.redirect('/auth/login?error=google');
        }

        if (!user && info?.requiresOnboarding) {
            req.session.pendingGoogleRegistration = {
                email: info.profile?.email || '',
                fname: info.profile?.fname || '',
                lname: info.profile?.lname || ''
            };
            return res.redirect('/shared/regi_choice.html?google=1');
        }

        if (!user) {
            return res.redirect('/auth/login?error=google');
        }

        req.session.pendingGoogleRegistration = null;
        req.session.user = {
            id: user.id,
            role: user.role
        };

        return res.redirect(getDashboardPathForRole(user.role));
    })(req, res, next);
});

router.get('/google/pending', (req, res) => {
    if (!req.session.pendingGoogleRegistration) {
        return res.status(404).json({ error: 'No pending Google registration' });
    }

    return res.json(req.session.pendingGoogleRegistration);
});

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

    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Valid email is required' });
    }

    if (!hasOtpMailConfig()) {
        return res.status(500).json({
            error: 'OTP email is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env.'
        });
    }

    const otp = generateOtp();
    const transporter = createOtpTransporter();
    const message = buildOtpMessage(otp);
    message.to = email;

    req.session.otp = otp;
    req.session.otpEmail = email;
    req.session.otpExpiresAt = Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000);
    req.session.otpVerified = false;

    try {
        await transporter.sendMail(message);
        return res.json({ message: 'OTP sent to your email', expiresInMinutes: OTP_EXPIRY_MINUTES });
    } catch (mailErr) {
        // Local/dev fallback so registration does not appear stuck when SMTP is unreachable.
        console.error('OTP email delivery failed:', mailErr.message);
        console.log(`[OTP fallback] ${email}: ${otp}`);

        const allowFallback = String(process.env.OTP_ALLOW_CONSOLE_FALLBACK || 'true').toLowerCase() === 'true';

        if (allowFallback) {
            return res.json({
                message: 'OTP generated. Email delivery failed; use server console OTP in development.',
                expiresInMinutes: OTP_EXPIRY_MINUTES,
                delivery: 'fallback'
            });
        }

        return res.status(502).json({ error: 'Unable to deliver OTP email right now. Please try again.' });
    }
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

    if (!req.session.otp || !req.session.otpEmail || !req.session.otpExpiresAt) {
        return res.status(400).json({ error: 'No OTP request found. Please request a new code.' });
    }

    if (Date.now() > req.session.otpExpiresAt) {
        req.session.otp = null;
        req.session.otpEmail = null;
        req.session.otpExpiresAt = null;
        return res.status(400).json({ error: 'OTP expired. Please request a new code.' });
    }

    if (
        String(otp || '').trim() === String(req.session.otp).trim() &&
        String(email || '').trim().toLowerCase() === String(req.session.otpEmail).trim().toLowerCase()
    ) {
        req.session.otpVerified = true;
        req.session.otp = null;
        req.session.otpEmail = null;
        req.session.otpExpiresAt = null;
        return res.json({ success: true });
    }

    res.status(400).json({ error: 'Invalid OTP' });
});

module.exports = router;