import { Schema } from "mongoose";

export interface Player {
  nickname: string;
  punchlines?: string[];
  score?: number;
}

export const PlayerSchema: Schema = new Schema({
  nickname: { type: String, required: true, unique: true },
  punchlines: [String],
  score: Number,
});
