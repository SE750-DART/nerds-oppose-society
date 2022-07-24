export type Player = {
  nickname: string;
  id: string;
  score: number;
};

export type Punchline = {
  text: string;
  new?: boolean;
  viewed?: boolean;
};

export type Setup = {
  setup: string;
  type: "PICK_ONE" | "PICK_TWO" | "DRAW_TWO_PICK_THREE";
};

export type Winner = {
  winningPlayerId: Player["id"];
  winningPunchlines: string[];
};
