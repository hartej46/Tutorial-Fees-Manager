import { Schema, model, Types } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

interface User {
  name: string;
  email: string;
  password: string;
}

const userSchema = new Schema<User>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

userSchema.methods.isPasswordCorrect = async function (password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
  const accessTokenData = {
    _id: this._id,
    email: this.email,
    username: this.username,
    fullName: this.fullName,
  };

  const accessToken = jwt.sign(accessTokenData, process.env.ACCESS_TOKEN_GENERATOR as string, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY as string,
  });

  return accessToken;
};

userSchema.methods.generateRefreshToken = async function () {
  const refreshTokenData = {
    _id: this._id,
    email: this.email,
    username: this.username,
    fullName: this.fullName,
  };

  const refreshToken = jwt.sign(refreshTokenData, process.env.REFRESH_TOKEN_GENERATOR as string, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY as string,
  });

  return refreshToken;
};

export const User = model<User>('User', userSchema);
