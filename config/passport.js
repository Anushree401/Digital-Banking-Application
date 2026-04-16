const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../database/models');

const hasGoogleOAuthCredentials = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

if (hasGoogleOAuthCredentials) {
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

            if (user) {
                return done(null, user);
            }

            // New Google identity: do not auto-create user. Hand off to onboarding flow.
            return done(null, false, {
                requiresOnboarding: true,
                profile: {
                    email,
                    fname: profile.name?.givenName || '',
                    lname: profile.name?.familyName || ''
                }
            });

        } catch (err) {
            return done(err, null);
        }
    }));
} else {
    console.warn('[auth] Google OAuth disabled: missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
}

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findByPk(id);
    done(null, user);
});

module.exports = passport;