import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  auth_method: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    unique: true
  },
  local: {
    password: {
      type: String
    }
  },
  google: {
    id: {
      type: String
    },
    image_url: {
      type: String
    }
  },
  facebook: {
    id: {
      type: String
    }
  }
},
  {
    collection: 'Users'
  });


userSchema.pre('save', function (next) {
  const user = this;
  if (user.auth_method !== 'local') {
    return next();
  }
  bcrypt.genSalt(10, function (error, salt) {
    if (error) throw error;
    bcrypt.hash(user.local.password, salt, function (err, hashPassword) {
      if (err) throw err;
      else {
        user.local.password = hashPassword;
        return next(user);
      }
    });
  });
});

const userModel = mongoose.model('Users', userSchema);

const comparePassword = (candidatePassword, hashPassword) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, hashPassword, (err, isMatch) => {
      if (err) reject(err);
      resolve(isMatch);
    });
  });
};

const saveUser = (user) => user.save();

const findUserByEmail = (email) => userModel.findOne({ email });

const findUserByEmailCB = (email, cb) => { userModel.findOne({ email }, cb); };

const findUserById = (id, cb) => { userModel.findById(id, cb); };

module.exports = {
  userModel,
  comparePassword,
  saveUser,
  findUserByEmail,
  findUserById,
  findUserByEmailCB
};