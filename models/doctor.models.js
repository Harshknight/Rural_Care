import { Schema, model } from 'mongoose';

const doctorSchema = new Schema({
  doctorName: {
    type: String,
    required: true,
  },  
  speciality: {
    type: String, 
    required: true,
  },  
  coverImageURL: {
    type: String,
    required: false,
  },  
  request: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },  
}, {timestamps: true}
);

const Doctor = model('Doctor', doctorSchema);

export default Doctor; 