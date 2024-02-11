import mongoose from 'mongoose';
import {Cat} from '../../types/DBTypes';

const CatSchema = new mongoose.Schema({
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const CatModel = mongoose.model<Cat>('Cat', CatSchema);

export default CatModel;
