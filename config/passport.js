const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../database/models');
const { Customer } = require('../database/models');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {

    try {
        const email = profile.emails[0].value;

        if (!email.endsWith('@gmail.com')) {
            return done(new Error('Only Gmail accounts allowed'), null);
        }
        let user = await User.findOne({ where: { email } });

        if (!user) {
            user = await User.create({
                fname: profile.name.givenName,
                lname: profile.name.familyName,
                email: email,
                password: null,
                role: 'customer'
            });

            await Customer.create({
                user_id: user.id
            });
        }

        return done(null, user);

    } catch (err) {
        return done(err, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findByPk(id);
    done(null, user);
});

module.exports = passport;