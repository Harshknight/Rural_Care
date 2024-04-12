import { Schema, model } from 'mongoose';

const appointmentSchema = new Schema({
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
  },  
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },  
  patientName: {
    type: String,
    ref: 'User',
  },  
  datetime: {
    type: String,
    default: "",
  },
  requestStatus: {
    type: Boolean,
    default: false,
  },  
  approveStatus: {
    type: String,
    default: 'false',
  },  

}, {timestamps: true}
);

export const Appointment = model('Appointment', appointmentSchema);

