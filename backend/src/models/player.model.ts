import { Document, Schema } from "mongoose";

export interface Player extends Document {
  nickname: string;
  punchlines?: string[];
  score?: number;
  new: boolean;
}

export const PlayerSchema: Schema = new Schema({
  nickname: { type: String, required: true, unique: true },
  punchlines: [String],
  score: Number,
  new: { type: Boolean, default: true },
});
