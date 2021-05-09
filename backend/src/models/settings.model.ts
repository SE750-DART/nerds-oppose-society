import { Document, Schema } from "mongoose";

export const MaxPlayers = 40;
export const MinPlayers = 3;

export interface Settings extends Document {
  roundLimit?: number;
  maxPlayers?: number;
}

export const SettingsSchema: Schema = new Schema({
  roundLimit: { type: Number, default: 69, min: 1 },
  maxPlayers: { type: Number, default: 25, min: MinPlayers, max: MaxPlayers },
});
