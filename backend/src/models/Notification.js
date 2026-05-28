import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  employe: { type: mongoose.Schema.Types.ObjectId, ref: 'Employe' },
  titre: { type: String },
  message: { type: String },
  type: { type: String },
  isRead: { type: Boolean },
}, {
  timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
