import { Document, Schema } from "mongoose";

export enum SetupType {
  pickOne = "PICK_ONE",
  pickTwo = "PICK_TWO",
  drawTwoPickThree = "DRAW_TWO_PICK_THREE",
}

export interface Setup extends Document {
  setup: string;
  type: SetupType;
}

export const SetupSchema: Schema = new Schema({
  setup: { type: String, required: true },
  type: {
    type: String,
    enum: Object.values(SetupType),
    default: SetupType.pickOne,
  },
});
