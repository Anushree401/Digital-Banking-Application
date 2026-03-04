const authService = require('../services/authService');

exports.showLogin = (req,res) => {
    res.render('login');
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
        else if (user.role === 'admin') {
            res.redirect('/admin/dashboard');
        }
    } catch (err) {
        return res.render('auth/login', { error: err.message });
    }

};