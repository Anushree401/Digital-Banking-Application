const authService = require('../services/authService');
const path = require('path');

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

    const { fname, lname, email, password, phone, role } = req.body;

    try {
        await authService.register(fname,lname,email,password,phone,role);
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        res.redirect('/auth/register?error=exists');
    }

};