import mongoose from 'mongoose';

/**
 * User preferences subdocument
 */
const preferencesSchema = new mongoose.Schema(
  {
    // If false, try to avoid assigning recipients from the same country
    allowSameCountry: { type: Boolean, default: false },
    languages: { type: [String], default: [] },
    bio: { type: String, default: '' }
  },
  { _id: false }
);

/**
 * User statistics subdocument
 */
const statsSchema = new mongoose.Schema(
  {
    sent: { type: Number, default: 0 },
    received: { type: Number, default: 0 },
    traveling: { type: Number, default: 0 },
    expired: { type: Number, default: 0 }
  },
  { _id: false }
);

/**
 * Main User schema
 */
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, index: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    // Placeholder for demo purposes; integrate real auth later
    passwordHash: { type: String, default: '' },
    countryCode: {
      type: String,
      required: true,
      trim: true,
      set: (v) => (v ? String(v).toUpperCase() : v),
      minlength: 2,
      maxlength: 3,
      index: true
    },
    preferences: { type: preferencesSchema, default: () => ({}) },
    stats: { type: statsSchema, default: () => ({}) }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

/**
 * Compute maximum traveling slots
 * - Base 5 slots + 1 extra for each 10 received
 */
export function computeMaxSlots(received = 0) {
  const base = 5;
  const bonus = Math.floor((received || 0) / 10);
  return base + bonus;
}

userSchema.methods.maxTravelingSlots = function () {
  return computeMaxSlots(this?.stats?.received || 0);
};

export const User = mongoose.model('User', userSchema);
