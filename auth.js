const passport = require('passport')
var GoogleStrategy = require('passport-google-oauth2').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_URL}/auth/google/callback`,
    passReqToCallback: true
},
    function (request, accessToken, refreshToken, profile, done) {
        console.log('---> Auth Connected')
        return done(null, profile);

    }
));


passport.serializeUser(function (user, done) {
    done(null, user)
})
passport.deserializeUser(function (user, done) {
    done(null, user)
})