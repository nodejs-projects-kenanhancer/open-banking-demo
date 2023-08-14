import { AmountDetails } from "./AmountDetails";

export type TransactionDetails = {
  AccountId: string;
  TransactionId: string;
  CreditDebitIndicator: string;
  Status: string;
  BookingDateTime: string;
  Amount: AmountDetails;
  ProprietaryBankTransactionCode: {
    Code: string;
  };
  TransactionInformation: string;
  Balance: {
    CreditDebitIndicator: string;
    Type: string;
    Amount: AmountDetails;
  };
};
