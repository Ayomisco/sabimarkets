export interface Market {
  id: string;            // on-chain market contract address
  condition_id: string;  // same as id (contract address)
  question: string;
  description: string;
  category: string;
  icon?: string;
  imageUri: string;
  outcomes: string[];
  outcomePrices: string[];   // ["0.50", "0.50"] — derived from on-chain YES/NO prices
  volume: string;            // totalCollateral in USDC (6 decimals, formatted)
  active: boolean;
  closed: boolean;
  resolved: boolean;
  outcome: number;           // 0=UNRESOLVED, 1=YES, 2=NO, 3=INVALID
  endDate: string;
  totalYesShares: string;
  totalNoShares: string;
  totalCollateral: string;
  createdAt: number;
  image: string;
}
