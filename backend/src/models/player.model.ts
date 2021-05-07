import { Document, Schema } from "mongoose";
import { v4 as uuid } from "uuid";

export interface Player extends Document {
  token: string;
  nickname: string;
  punchlines: string[];
  score: number;
  new: boolean;
}

export const PlayerSchema: Schema = new Schema({
  token: { type: String, default: () => uuid() },
  nickname: { type: String, required: true },
  punchlines: [String],
  score: { type: Number, default: 0 },
  new: { type: Boolean, default: true },
});
