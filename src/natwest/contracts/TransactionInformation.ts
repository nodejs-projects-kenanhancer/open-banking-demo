import { TransactionDetails } from "./TransactionDetails";

export type TransactionInformation = {
  Data: {
    Transaction: TransactionDetails[];
  };
  Links: {
    Self: string;
    First: string;
    Last: string;
  };
  Meta: {
    TotalPages: number;
  };
};
