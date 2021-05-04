import { Document, Schema } from "mongoose";

export interface Player extends Document {
  nickname: string;
  punchlines?: string[];
  score?: number;
}

export const PlayerSchema: Schema = new Schema({
  nickname: { type: String, required: true },
  punchlines: [String],
  score: Number,
});
