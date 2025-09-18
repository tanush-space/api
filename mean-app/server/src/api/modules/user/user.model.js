const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    role: { type: String, enum: ['volunteer', 'ngo'], required: true },
    location: { type: String, default: '' },
    skills: { type: [String], default: [] },
    organizationName: { type: String, default: '' },
    organizationDescription: { type: String, default: '' },
    websiteUrl: { type: String, default: '' }
  },
  { timestamps: true }
);

UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });

module.exports = mongoose.model('User', UserSchema);


