import { Schema, model } from 'mongoose';

const requestSchema = new Schema({
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
  },  
  patientName: {
    type: String, 
    required: true,
  },  
  location: {
    type: String,
    required: false,
  },  
  bloodType: {
    type: String,
    ref: 'User', 
  },  
}, {timestamps: true}
);

export const Request = model('Request', requestSchema);
