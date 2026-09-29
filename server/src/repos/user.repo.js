//communicate with the user's models (similar to CRUD Operations)
import mongoose from "mongoose";
import { User } from "../models/user.model.js";

export async function existsByEmail(email) {
  const found = await User.exists({ email: String(email) });
  return found !== null;
}

export function findByEmailWithPassword(email) {
  return User.findOne({ email: String(email) }).select("+passwordHash");
}

//returns null for malformed id, password
export function findById(id){
  if (!mongoose.isValidObjectId(id)) return null;
  return User.findById(id).lean();
}

export function create({ name, email, passwordHash }) {
  return User.create({ name, email, passwordHash });
}