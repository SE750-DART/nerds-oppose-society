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
