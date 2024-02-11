import {Request, Response, NextFunction} from 'express';
import {User, UserOutput} from '../../types/DBTypes';
import {MessageResponse} from '../../types/MessageTypes';
import userModel from '../models/userModel';
import bcrypt from 'bcryptjs';

const userGet = async (
  req: Request<{id: string}, {}, {}, {}>,
  res: Response<UserOutput>,
  next: NextFunction
) => {
  try {
    const user = await userModel
      .findById(req.params.id)
      .select('-password -role');
    if (!user) {
      res.status(404);
      console.log('User not found');
      return;
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const userListGet = async (
  _req: Request,
  res: Response<UserOutput[]>,
  next: NextFunction
) => {
  try {
    const users = await userModel.find().select('-password -role');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const userPost = async (
  req: Request<{}, {}, User>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.role) {
      req.body.role = 'user';
    }
    const salt = bcrypt.genSaltSync(10);
    const userInput = {
      user_name: req.body.user_name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, salt),
      role: req.body.role,
    };

    const user = await userModel.create(userInput);
    const userOutput: UserOutput = {
      _id: user._id,
      user_name: user.user_name,
      email: user.email,
    };
    res.status(200).json({message: 'User created', data: userOutput});
  } catch (err) {
    next(err);
  }
};

const userPutCurrent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = (res.locals.user as User)._id;
    const user = await userModel
      .findByIdAndUpdate(id, req.body, {
        new: true,
      })
      .select('-password -role');
    if (!user) {
      res.status(404);
      console.log('User not found');
      return;
    }
    res.json({message: 'User updated', data: user as UserOutput});
  } catch (err) {
    next(err);
  }
};

const userDeleteCurrent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as User)._id;
    const deletedUser = await userModel
      .findByIdAndDelete(userId, req.body)
      .select('-password -role');
    if (!deletedUser) {
      res.status(404);
      console.log('User not found');
      return;
    }
    res.json({message: 'User deleted', data: deletedUser as UserOutput});
  } catch (error) {
    next(error);
  }
};

const checkToken = (
  req: Request,
  res: Response<UserOutput>,
  next: NextFunction
) => {
  res.json(res.locals.user);
};

export {
  userGet,
  userListGet,
  userPost,
  userPutCurrent,
  userDeleteCurrent,
  checkToken,
};
