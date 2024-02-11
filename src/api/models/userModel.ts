import mongoose from 'mongoose';
import {User} from '../../types/DBTypes';

const userSchema = new mongoose.Schema({
  user_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const UserModel = mongoose.model<User>('User', userSchema);

export default UserModel;
