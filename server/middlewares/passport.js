import { Strategy, ExtractJwt } from 'passport-jwt';
import passportGoogleOauth from 'passport-google-oauth';
const GoogleStrategy = passportGoogleOauth.OAuth2Strategy;

import { findUserById, findUserByEmailCB, userModel, saveUser, findAndUpdate } from '../modules/Users/Model';
import {
  googleAuth,
  JWT_SECRET
} from '../../config/Oauth_config';

const JwtStrategy = Strategy;


module.exports = (passport) => {


  // used to serialize the user for the session
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function (id, done) {
    userModel.findById(id, function (err, user) {
      done(err, user);
    });
  });


  const opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
  opts.secretOrKey = JWT_SECRET;
  passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    findUserById(jwt_payload._id, (err, user) => {
      if (err) done(err, false);
      else if (user) done(null, user);
      else done(null, false);
    });
  }));

  passport.use('google', new GoogleStrategy({
    clientID: googleAuth.clientID,
    clientSecret: googleAuth.clientSecret,
    callbackURL: googleAuth.callbackURL
  }, (accessToken, refreshToken, profile, done) => {

    const userEmail = profile.emails[0].value;

    findUserByEmailCB(userEmail, (err, user) => {
      if (err) {
        return done(err, false);
      }
      if (user) {
        // Add google id to local login details as well
        findAndUpdate(user._id, {
          google: {
            id: profile.id
          }
        })
          .then(saved_user => {
            return done(null, user);
          })
          .catch(error => {
            return done(error, false);
          });
      } else {
        const newUser = new userModel({
          auth_method: 'google',
          email: userEmail,
          google: {
            id: profile.id,
            image_url: profile._json.image.url
          }
        });

        return saveUser(newUser)
          .then(saved_user => {
            done(null, saved_user);
          });
      }
    });
  }));
};
