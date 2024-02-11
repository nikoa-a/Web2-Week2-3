import {Request, Response, NextFunction} from 'express';
import CustomError from '../../classes/CustomError';
import catModel from '../models/catModel';
import {Cat, User} from '../../types/DBTypes';
import {MessageResponse} from '../../types/MessageTypes';

const catGetByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cats = await catModel.find({owner: res.locals.user._id}).populate({
      path: 'owner',
      select: '-__v -password -role',
    });
    res.json(cats);
  } catch (error) {
    next(error);
  }
};

const catGetByBoundingBox = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {north, south, east, west} = req.query;
    const cats = await catModel.find({
      'coords.coordinates': {
        $geoWithin: {
          $geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [west, south],
                [west, north],
                [east, north],
                [east, south],
                [west, south],
              ],
            ],
          },
        },
      },
    });
    res.json(cats);
  } catch (error) {
    next(error);
  }
};

const catPutAdmin = async (
  req: Request<{id: string}, {}, Omit<Cat, '_id'>>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user && (req.user as User).role !== 'admin') {
      throw new CustomError('Access restricted', 403);
    }
    req.body.location = res.locals.coords;
    const cat = await catModel
      .findByIdAndUpdate(req.params.id, req.body, {new: true})
      .select('-__v');
    if (!cat) {
      throw new CustomError('Cat not found', 404);
    }
    res.json({message: 'Cat updated', data: cat});
  } catch (err) {
    next(err);
  }
};

const catDeleteAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {catId} = req.params;
    const deletedCat = await catModel.findByIdAndDelete(catId);
    if (!deletedCat) {
      throw new CustomError('Cat not found', 404);
    }
    res.json({message: 'Cat deleted'});
  } catch (error) {
    next(error);
  }
};

const catDelete = async (
  req: Request<{id: string}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const cat = (await catModel.findOneAndDelete({
      _id: req.params.id,
      owner: res.locals.user._id,
    })) as unknown as Cat;

    if (!cat) {
      throw new CustomError('Cat not found', 404);
    }
    res.json({message: 'Cat deleted', data: cat});
  } catch (err) {
    next(err);
  }
};

const catPut = async (
  req: Request<{id: string}, {}, Omit<Cat, '_id'>>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user && (req.user as User)._id !== (req.body as Cat).owner) {
      throw new CustomError('Access restricted', 403);
    }
    req.body.location = res.locals.coords;
    const cat = await catModel
      .findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      })
      .select('-__v');
    if (!cat) {
      throw new CustomError('Cat not found', 404);
    }
    res.json({message: 'Cat updated', data: cat});
  } catch (err) {
    next(err);
  }
};

const catGet = async (
  req: Request<{id: string}>,
  res: Response<Cat>,
  next: NextFunction
) => {
  try {
    const cat = await catModel.findById(req.params.id).populate({
      path: 'owner',
      select: '-__v -password -role',
    });
    if (!cat) {
      throw new CustomError('Cat not found', 404);
    }
    res.json(cat);
  } catch (err) {
    next(err);
  }
};

const catListGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cats = await catModel.find();
    res.json(cats);
  } catch (error) {
    next(error);
  }
};

const catPost = async (
  req: Request<{}, {}, Cat>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {cat_name, birthdate, weight} = req.body;

    if (!req.file) {
      return res.status(400).json({error: 'No file uploaded'});
    }

    const filename = req.file.filename;

    const cat = await catModel.create({
      cat_name: cat_name,
      weight: weight,
      filename: filename,
      birthdate: birthdate,
      location: res.locals.coords,
      owner: (req.user as User)._id,
    });

    const message: MessageResponse = {
      message: 'Cat added',
    };
    res.json({message, data: cat});
  } catch (error) {
    next(error);
  }
};

export {
  catGetByUser,
  catGetByBoundingBox,
  catPutAdmin,
  catDeleteAdmin,
  catDelete,
  catPut,
  catGet,
  catListGet,
  catPost,
};
