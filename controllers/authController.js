const authService = require('../services/authService');

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
        else if (user.role === 'admin') {
            res.redirect('/admin/dashboard');
        }

        // const fullPath = path.join(__dirname, '../views/shared/login.html');
        // console.log(fullPath);
        // res.sendFile(fullPath);

    } catch (err) {
        return res.redirect('/auth/login?error=invalid');
    }

};