import mongoose from 'mongoose';

/**
 * Embedded snapshot of a recipient's address at the time the postcard
 * was created. This ensures the address used for mailing is immutable,
 * even if the user later updates their primary address.
 */
const addressSnapshotSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, default: '', trim: true },
    city: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    countryCode: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 3,
      trim: true,
      set: (v) => (v ? String(v).toUpperCase() : v)
    }
  },
  { _id: false }
);

/**
 * Postcard model captures a single send action from a sender to a recipient.
 * The `code` follows the format "<SENDER_COUNTRY>-<SEQUENCE>", e.g., "US-12345".
 */
const postcardSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },

    // Relations
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    senderCountryCode: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 3,
      trim: true,
      set: (v) => (v ? String(v).toUpperCase() : v),
      index: true
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    // Snapshot of recipient address at assignment time
    recipientAddressSnapshot: {
      type: addressSnapshotSchema,
      required: true
    },

    // Lifecycle
    status: {
      type: String,
      enum: ['traveling', 'received', 'expired'],
      default: 'traveling',
      index: true
    },
    requestedAt: { type: Date, default: () => new Date(), index: true },
    mailedAt: { type: Date },
    receivedAt: { type: Date },

    // Optional user content
    message: { type: String, default: '' },
    imageUrl: { type: String, default: '' }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(_doc, ret) {
        // Present id as string and hide _id
        if (ret._id) ret.id = String(ret._id);
        delete ret._id;
        return ret;
      }
    }
  }
);

// Helpful compound index for common queries
postcardSchema.index({ senderId: 1, status: 1, requestedAt: -1 });
postcardSchema.index({ recipientId: 1, status: 1 });

// Static helper to validate postcard codes (e.g., "US-11797804")
const CODE_RE = /^[A-Z]{2}-\d+$/;
postcardSchema.statics.isValidCode = function isValidCode(code) {
  return CODE_RE.test(String(code || '').toUpperCase());
};

export const Postcard = mongoose.model('Postcard', postcardSchema);
export const AddressSnapshotSchema = addressSnapshotSchema;
