export interface Token {
  token_id: string;
  outcome: string;
  price: number;
}

export interface Market {
  id: string;
  condition_id: string;
  question: string;
  description: string;
  icon?: string;
  outcomes: string[];
  outcomePrices: string[];
  volume: string;
  active: boolean;
  closed: boolean;
  endDate: string;
  image: string;
  tokens: Token[];
  clobTokenIds: string[];
}
