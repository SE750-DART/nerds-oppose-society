import { Document, Schema } from "mongoose";

export interface Player extends Document {
  nickname: string;
  punchlines: string[];
  score: number;
  new: boolean;
}

export const PlayerSchema: Schema = new Schema({
  nickname: { type: String, required: true },
  punchlines: [String],
  score: { type: Number, default: 0 },
  new: { type: Boolean, default: true },
});
