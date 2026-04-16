const authService = require('../services/authService');
const { sendRegistrationConfirmation } = require('../services/emailService');

exports.showLogin = (req,res) => {
    const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    res.redirect('/shared/login.html' + query);
};

exports.loginUser = async (req,res) => {
    
    const {email,password} = req.body;

    try {
        const user = await authService.login(email,password);
        req.session.user = {
            id: user.id,
            role: user.role
        };
        console.log("LOGIN SESSION:", req.session);
        if (user.role === 'customer') {
            res.redirect('/customer/dashboard');
        }
        else if (user.role === 'loan_officer') {
            res.redirect('/loan_officer/dashboard');
        }
        else if (user.role === 'investor') {
            res.redirect('/investor/dashboard');
        }

        // const fullPath = path.join(__dirname, '../views/shared/login.html');
        // console.log(fullPath);
        // res.sendFile(fullPath);

    } catch (err) {
        return res.redirect('/auth/login?error=invalid');
    }

};

exports.showRegister = (req,res) => {
    const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    res.redirect('/shared/register.html' + query);
};

exports.registerUser = async (req,res) => {

    const { fname, lname, email, password, phone, role, customerType, pan, aadhaar } = req.body;
    const normalizedRole = role === 'officer' ? 'loan_officer' : role;
    const pendingGoogle = req.session.pendingGoogleRegistration || null;
    const isGoogleCompletion = Boolean(
        pendingGoogle &&
        pendingGoogle.email &&
        String(pendingGoogle.email).toLowerCase() === String(email || '').toLowerCase()
    );

    try {
        if (!isGoogleCompletion && !req.session.otpVerified) {
            return res.redirect('/auth/register?error=otp_required');
        }

        const user = await authService.register(
            fname,
            lname,
            email,
            password,
            phone,
            normalizedRole,
            customerType,
            pan,
            aadhaar,
            { isGoogleAuth: isGoogleCompletion }
        );

        if (!isGoogleCompletion) {
            try {
                await sendRegistrationConfirmation({
                    to: email,
                    name: [fname, lname].filter(Boolean).join(' ').trim() || fname || 'there'
                });
            } catch (mailErr) {
                console.error('Registration confirmation email failed:', mailErr.message);
            }

            req.session.otpVerified = false;
            return res.redirect('/auth/login');
        }

        req.session.pendingGoogleRegistration = null;
        req.session.otpVerified = false;
        req.session.user = {
            id: user.id,
            role: user.role
        };

        if (user.role === 'customer') {
            return res.redirect('/customer/dashboard');
        }

        if (user.role === 'loan_officer') {
            return res.redirect('/loan_officer/dashboard');
        }

        if (user.role === 'investor') {
            return res.redirect('/investor/dashboard');
        }

        return res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        res.redirect('/auth/register?error=exists');
    }

};