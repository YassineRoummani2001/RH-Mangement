import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  roles: {
    type: [String],
    default: ['ROLE_EMPLOYE'],
  },
  password: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  employe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employe',
  }
}, {
  timestamps: true, // adds createdAt and updatedAt
});

// Method to remove password when returning user object
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);
export default User;
