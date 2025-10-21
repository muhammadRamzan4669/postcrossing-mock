import mongoose from 'mongoose';

/**
 * Address schema for a user's postal address.
 * A user may have multiple addresses, but typically one primary address is used for receiving postcards.
 */
const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Recipient details
    fullName: { type: String, required: true, trim: true },

    // Address lines
    line1: { type: String, required: true, trim: true },
    line2: { type: String, default: '', trim: true },

    // Locality details
    city: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },

    // ISO country code (2-3 letters). Normalized to uppercase.
    countryCode: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 3,
      set: (v) => (v ? String(v).toUpperCase() : v)
    },

    // Flags
    isPrimary: { type: Boolean, default: true, index: true },
    validated: { type: Boolean, default: true }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(_doc, ret) {
        // Keep objectId fields as strings
        if (ret._id) ret.id = String(ret._id);
        delete ret._id;
        return ret;
      }
    }
  }
);

// Helpful compound index for quick lookups
addressSchema.index({ userId: 1, isPrimary: 1 });

// Optional: enforce at most one primary address per user (MongoDB partial index).
// This requires MongoDB 3.2+.
// It makes the pair (userId, isPrimary) unique only when isPrimary === true.
addressSchema.index(
  { userId: 1 },
  { unique: true, partialFilterExpression: { isPrimary: true } }
);

export const Address = mongoose.model('Address', addressSchema);
