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

const catPutAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {catId} = req.params;
    const {ownerId} = req.body;
    const updatedCat = await catModel.findByIdAndUpdate(
      catId,
      {'owner._id': ownerId},
      {new: true}
    );
    if (!updatedCat) {
      throw new CustomError('Cat not found', 404);
    }
    res.json(updatedCat);
  } catch (error) {
    next(error);
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
    // admin can delete any animal, user can delete only their own animals
    const options =
      res.locals.user.role === 'admin' ? {} : {owner: res.locals.user._id};

    const animal = (await catModel.findOneAndDelete({
      _id: req.params.id,
      ...options,
    })) as unknown as Cat;

    if (!animal) {
      throw new CustomError('Cat not found or not your cat', 404);
    }
    res.json({message: 'Cat deleted', _id: animal._id});
  } catch (error) {
    next(error);
  }
};

const catPut = async (
  req: Request<{id: string}, {}, Cat>,
  res: Response,
  next: NextFunction
) => {
  try {
    const catId = req.params.id;

    // Create an object to hold the updated fields
    const updatedCat: Partial<Cat> = {};

    if (req.body.cat_name) {
      updatedCat.cat_name = req.body.cat_name;
    }

    if (req.body.weight) {
      updatedCat.weight = req.body.weight;
    }

    if (req.body.birthdate) {
      updatedCat.birthdate = req.body.birthdate;
    }

    // Check if there are any fields to update
    if (Object.keys(updatedCat).length === 0) {
      // No fields to update, return a message or error as needed
      return res.status(400).json({error: 'No fields to update'});
    }

    const updatedCatDocument = await catModel.findByIdAndUpdate(
      catId,
      updatedCat,
      {
        new: true, // Return the updated document
        runValidators: true, // Run mongoose validation checks
      }
    );

    if (!updatedCatDocument) {
      next(new CustomError('Cat not found', 404));
      return;
    }

    if (
      updatedCatDocument.owner.toString() !== (req.user as User)._id.toString()
    ) {
      next(new CustomError('Not authorized', 401));
      return;
    }

    res.json(res.json({message: 'Cat modified', data: updatedCatDocument}));
  } catch (error) {
    next(new CustomError('Database error', 500));
  }
};

const catGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {catId} = req.params;
    const cat = await catModel.findById(catId);
    if (!cat) {
      throw new CustomError('Cat not found', 404);
    }
    res.json(cat);
  } catch (error) {
    next(error);
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
