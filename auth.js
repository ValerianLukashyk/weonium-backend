const passport = require('passport')
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
    function (username, password, done) {
        User.findOne({ username: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (!user.validPassword(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    }
));

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