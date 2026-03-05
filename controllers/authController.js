const authService = require('../services/authService');
const path = require('path');

exports.showLogin = (req,res) => {
    res.sendFile(path.join(__dirname, '../views/shared/login.html'));
};

exports.loginUser = async (req,res) => {
    
    const {email,password} = req.body;

    try {
        const user = await authService.login(email,password);
        req.session.user = {
            id: user.user_id,
            role: user.role
        };
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
    res.sendFile(path.join(__dirname, '../views/shared/register.html'));
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