import passport from 'passport';
import { isValidString, genToken } from '../../utils/utils';
import { createNewUser, userLogin } from './Handler';


const jwtAuthenticate = passport.authenticate('jwt', { session: false });
const googleAuthenticate = passport.authenticate('google', { scope: ['profile', 'email'] });
// const googleAuthenticateRedirect = passport.authenticate('google', {
//     successRedirect: '/hello',
//     failureRedirect: '/',
//     scope: ['profile', 'email']
// });

export default (router) => {
    router.post('/signup', function (req, res) {
        const email = req.body.email;
        const password = req.body.password;
        if (isValidString(email) && isValidString(password)) {
            createNewUser(email, password)
                .then(result => {
                    return res.status(201).json({
                        success: true,
                        message: 'User created successfully'
                    });
                })
                .catch(err => {
                    return res.status(err.statusCode || 500).json({
                        success: false,
                        message: err.message
                    });
                });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Missing email or password'
            });
        }
    });

    router.post('/signin', (req, res) => {
        const email = req.body.email;
        const password = req.body.password;
        if (isValidString(email) && isValidString(password)) {
            userLogin(email, password)
                .then(result => {
                    return res.status(200).json(result);
                })
                .catch(err => {
                    return res.status(err.statusCode || 500).json({
                        success: false,
                        message: err.message
                    });
                });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Missing email or password'
            });
        }
    });

    router.get('/profile', jwtAuthenticate, (req, res) => {
        return res.json({
            _id: req.user._id,
            auth_method: req.user.auth_method,
            email: req.user.email
        });
    });

    router.get('/auth/google', googleAuthenticate);

    // the callback after google has authenticated the user
    router.get('/auth/google/callback', googleAuthenticate, (req, res) => {
        res.status(200).json({
            token: genToken(req.user)
        });
    });
};