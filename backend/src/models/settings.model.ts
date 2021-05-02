import { Schema } from "mongoose";

export interface Settings {
  roundLimit?: number;
  maxPlayers?: number;
}

export const SettingsSchema: Schema = new Schema({
  roundLimit: { type: Number, default: 69 },
  maxPlayers: { type: Number, default: 25 },
});
