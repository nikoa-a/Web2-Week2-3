import mongoose from 'mongoose';
import {Cat} from '../../types/DBTypes';

const CatSchema = new mongoose.Schema<Cat>({
  cat_name: {
    type: String,
    required: true,
    unique: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  birthdate: {
    type: Date,
    required: true,
    max: Date.now(),
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  owner: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    user_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
});

const CatModel = mongoose.model<Cat>('Cat', CatSchema);

export default CatModel;
