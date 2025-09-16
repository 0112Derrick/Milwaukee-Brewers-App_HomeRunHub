// Generated from https://statsapi.mlb.com/api/v1/transactions
export interface TransactionsResponse {
  copyright: string;
  transactions: Transaction[];
}

export interface Transaction {
  date: Date;
  description: string;
  effectiveDate: Date;
  id: number;
  person: Person;
  resolutionDate: Date;
  toTeam: ToTeam;
  typeCode: TypeCode;
  typeDesc: TypeDesc;
}

export interface Person {
  fullName: string;
  id: number;
  link: string;
}

export interface ToTeam {
  id: number;
  link: string;
  name: string;
}

export type TypeCode = string;

export type TypeDesc = string;
