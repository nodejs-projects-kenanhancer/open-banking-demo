import { AccountData } from "./AccountData";

export type AccountDetails = {
  AccountId: string;
  Currency: string;
  AccountType: string;
  AccountSubType: string;
  Description: string;
  Nickname: string;
  Account: AccountData[];
};
