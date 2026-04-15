document.addEventListener('DOMContentLoaded', function() {
});

exports.isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
};

exports.authorize = (role) => {
    return (req, res, next) => {
        if (!req.session.user || req.session.user.role !== role) {
            return res.status(403).send('Forbidden');
        }
        next();
    };
};

