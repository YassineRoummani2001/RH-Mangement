import mongoose from 'mongoose';

const auditlogSchema = new mongoose.Schema({
  action: { type: String },
  user: { type: String },
  details: { type: String },
}, {
  timestamps: true
});

const AuditLog = mongoose.model('AuditLog', auditlogSchema);
export default AuditLog;
