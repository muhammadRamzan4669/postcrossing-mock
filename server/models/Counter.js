import mongoose from 'mongoose';

/**
 * Counter collection to maintain per-country sequential numbers
 * for postcard codes. Example code format: "US-12345".
 */
const counterSchema = new mongoose.Schema(
  {
    countryCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 3,
      set: (v) => (v ? String(v).toUpperCase() : v)
    },
    seq: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Ensure fast lookups by country (unique: true already defined in schema field)
counterSchema.index({ countryCode: 1 });

/**
 * Atomically increments and returns the next sequence number for a country.
 * Use within a transaction session when generating postcard codes.
 *
 * @param {string} countryCode - ISO alpha-2/3 country code
 * @param {mongoose.ClientSession} [session] - Optional transaction session
 * @returns {Promise<number>} The incremented sequence number
 */
counterSchema.statics.incrementAndGet = async function incrementAndGet(countryCode, session) {
  const doc = await this.findOneAndUpdate(
    { countryCode: String(countryCode).toUpperCase() },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, session }
  );
  return doc.seq;
};

/**
 * Helper to build a postcard code from country and sequence.
 * @param {string} countryCode
 * @param {number} seq
 * @returns {string}
 */
export function buildPostcardCode(countryCode, seq) {
  return `${String(countryCode).toUpperCase()}-${seq}`;
}

export const Counter = mongoose.model('Counter', counterSchema);
