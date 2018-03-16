import { findUserByEmail, userModel, saveUser, comparePassword } from './Model';
import { genToken } from '../../utils/utils';

const createNewUser = (email, password) => {
  return findUserByEmail(email)
    .then(user => {
      // User Found
      if (user) {
        return Promise.reject({
          statusCode: 200,
          message: 'User with this email ID already exists'
        });
      } else { // Create a new user
        const newUser = new userModel({
          auth_method: 'local',
          email: email,
          local: {
            password: password
          }
        });

        return saveUser(newUser);
      }
    })
    .catch(error => {
      return Promise.reject(error);
    });
};


const userLogin = (email, password) => {
  //  Find the user exists with email
  return findUserByEmail(email)
    .then(user => {
      if (!user) return Promise.reject({
        statusCode: 404,
        message: `No user exists with ${email} address`
      });
      else if (user && user.auth_method === 'local') {
        return comparePassword(password, user.local.password)
          .then(match => {
            if (!match) return Promise.reject({
              statusCode: 401,
              message: 'Password didn\'t match'
            });
            else {
              const token = genToken(user);
              return Promise.resolve({
                token: token,
                user: {
                  email: user.email
                }
              });
            }
          })
          .catch(error => {
            return Promise.reject(error);
          });
      }
    })
    .catch(err => {
      return Promise.reject(err);
    });
};


module.exports = {
  createNewUser,
  userLogin
};