import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config/Oauth_config';

function hasValue(obj, key) {
    return (obj.hasOwnProperty(key) && obj[key] !== 'undefined') ? true : false;
};

function checkParams(body, bodyArr) {
    for (let i = 0; i < bodyArr.length; i++) {
        if (!hasValue(body, bodyArr[i])) {
            return {
                success: false,
                value: bodyArr[i]
            };
        }
    }
    return {
        success: true
    };
}

const isValidString = (str) => str.trim().length > 0;

const genToken = (user) => 'jwt ' + jwt.sign(user.toJSON(), JWT_SECRET, { expiresIn: 604800 });


module.exports = {
    checkParams,
    isValidString,
    genToken
};