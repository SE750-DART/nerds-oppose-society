import { Document, Schema } from "mongoose";
import { SetupSchema, Setup } from "./setup.model";
import { Player } from "./player.model";

export enum RoundState {
  before = "BEFORE",
  playersChoose = "PLAYERS_CHOOSE",
  hostChooses = "HOST_CHOOSES",
  after = "AFTER",
}

export interface Round extends Document {
  setup: Setup;
  host: Player["id"];
  playersByPunchline: Map<string, Player["id"]>;
  state: RoundState;
}

export const RoundSchema: Schema = new Schema({
  setup: { type: SetupSchema, required: true },
  host: { type: String, required: true },
  playersByPunchline: { type: Map, of: String, default: () => ({}) },
  state: {
    type: String,
    enum: Object.values(RoundState),
    default: RoundState.before,
  },
});
