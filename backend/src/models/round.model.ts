import { ObjectId, Schema } from "mongoose";
import { SetupSchema, Setup } from "./setup.model";

export interface Round {
  setup: Setup;
  playersByPunchline: Map<string, ObjectId>;
}

export const RoundSchema: Schema = new Schema({
  setup: { type: SetupSchema, required: true },
  playersByPunchline: { type: Map, required: true },
});
