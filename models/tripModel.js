import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  userID: { type: String, required: true }, 
  tripName: { type: String, required: true },
  gpsData: { type: Array, required: true }, 
  createdAt: { type: Date, default: Date.now } 
});
const Trip = mongoose.model('Trip', tripSchema);

export default Trip;
