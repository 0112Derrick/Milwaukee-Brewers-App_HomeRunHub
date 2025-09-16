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
  toTeam: Team;
  fromTeam?: Team;
  typeCode: TypeCode;
  typeDesc: TypeDesc;
}

export interface Person {
  fullName: string;
  id: number;
  link: string;
}

export interface Team {
  id?: number;
  link?: string;
  name?: string;
}

export type TypeCode =
  | "TR"
  | "OPT"
  | "ASG"
  | "SFA"
  | "REL"
  | "SC"
  | "CU"
  | "OUT"
  | "SE"
  | "DES"
  | "OPT";

export type TypeDesc =
  | string
  | "Trade"
  | "Optioned"
  | "Assigned"
  | "Signed as Free Agent"
  | "Released"
  | "Status Change"
  | "Recalled"
  | "Outrighted"
  | "Selected"
  | "Designated for Assignment"
  | "Optioned";
