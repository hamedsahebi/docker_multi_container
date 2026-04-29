import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * User Document interface for MongoDB - uses Date objects
 */
export interface IUser {
  email: string;
  name: string;
  googleId: string;
  picture?: string;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User Document interface extending Mongoose Document
 */
export interface UserDocument extends IUser, Document {
  _id: mongoose.Types.ObjectId;
  updateLastLogin(): Promise<UserDocument>;
}

/**
 * User Schema for MongoDB
 */
const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      validate: {
        validator: (email: string) => {
          // Basic email validation
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: 'Invalid email format',
      },
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    googleId: {
      type: String,
      required: [true, 'Google ID is required'],
      unique: true,
      index: true,
    },
    picture: {
      type: String,
      trim: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    collection: 'users',
  }
);

/**
 * Indexes for optimized queries
 */
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ createdAt: -1 });

/**
 * Transform the document to match our User interface
 * This method is called when converting to JSON
 */
userSchema.set('toJSON', {
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    // Convert Date objects to ISO strings
    if (ret.createdAt) ret.createdAt = ret.createdAt.toISOString();
    if (ret.updatedAt) ret.updatedAt = ret.updatedAt.toISOString();
    if (ret.lastLogin) ret.lastLogin = ret.lastLogin.toISOString();
    return ret;
  },
});

/**
 * Transform the document to match our User interface
 * This method is called when converting to Object
 */
userSchema.set('toObject', {
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    // Convert Date objects to ISO strings
    if (ret.createdAt) ret.createdAt = ret.createdAt.toISOString();
    if (ret.updatedAt) ret.updatedAt = ret.updatedAt.toISOString();
    if (ret.lastLogin) ret.lastLogin = ret.lastLogin.toISOString();
    return ret;
  },
});

/**
 * Instance Methods
 */

// Update the user's last login timestamp
userSchema.methods.updateLastLogin = function (this: UserDocument): Promise<UserDocument> {
  this.lastLogin = new Date();
  return this.save();
};

/**
 * Static Methods
 */

// Find user by email
userSchema.statics.findByEmail = function (email: string): Promise<UserDocument | null> {
  return this.findOne({ email: email.toLowerCase() });
};

// Find user by Google ID
userSchema.statics.findByGoogleId = function (googleId: string): Promise<UserDocument | null> {
  return this.findOne({ googleId });
};

// Check if user exists by email
userSchema.statics.existsByEmail = function (email: string): Promise<boolean> {
  return this.exists({ email: email.toLowerCase() }).then((result: any) => !!result);
};

/**
 * Pre-save middleware
 */
userSchema.pre('save', function (this: UserDocument, next) {
  // Ensure email is lowercase
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  next();
});

/**
 * User Model Interface with static methods
 */
interface UserModel extends Model<UserDocument> {
  findByEmail(email: string): Promise<UserDocument | null>;
  findByGoogleId(googleId: string): Promise<UserDocument | null>;
  existsByEmail(email: string): Promise<boolean>;
}

/**
 * Export the User model
 */
export const UserModel = mongoose.model<UserDocument, UserModel>('User', userSchema);

export default UserModel;
