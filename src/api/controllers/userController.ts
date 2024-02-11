import {Request, Response, NextFunction} from 'express';
import {User, UserOutput} from '../../types/DBTypes';
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
    const salt = bcrypt.genSaltSync(10);

    const userInput = {
      user_name: req.body.user_name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, salt),
      role: 'user',
    };
    console.log(userInput);

    const user = await userModel.create(userInput);

    const userOutput: UserOutput = {
      _id: user._id,
      user_name: user.user_name,
      email: user.email,
    };

    console.log(user);
    res.json({message: 'User created!', data: userOutput});
  } catch (error) {
    next(error);
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
    const id = (res.locals.user as User)._id;
    const user = await userModel
      .findByIdAndDelete(id, req.body)
      .select('-password -role');
    if (!user) {
      res.status(404);
      console.log('User not found');
      return;
    }
    res.json({message: 'User deleted', data: user as UserOutput});
  } catch (err) {
    next(err);
  }
};

const checkToken = async (
  req: Request,
  res: Response<UserOutput>,
  next: NextFunction
) => {
  if (!res.locals.user) {
    res.status(403);
    console.log('User not valid');
  } else {
    const userOutput: UserOutput = {
      _id: (res.locals.user as User)._id,
      email: (res.locals.user as User).email,
      user_name: (res.locals.user as User).user_name,
    };
    res.json(userOutput);
  }
};

export {
  userGet,
  userListGet,
  userPost,
  userPutCurrent,
  userDeleteCurrent,
  checkToken,
};
