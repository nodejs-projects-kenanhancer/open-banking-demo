export type ConsentInformation = {
  Data: {
    ConsentId: string;
    CreationDateTime: string;
    Status: string;
    StatusUpdateDateTime: string;
    Permissions: [
      | "ReadAccountsDetail"
      | "ReadBalances"
      | "ReadBeneficiariesDetail"
      | "ReadDirectDebits"
      | "ReadProducts"
      | "ReadStandingOrdersDetail"
      | "ReadTransactionsCredits"
      | "ReadTransactionsDebits"
      | "ReadTransactionsDetail"
      | "ReadScheduledPaymentsDetail"
      | "ReadStatementsBasic"
      | "ReadStatementsDetail"
      | "NWGReadDirectAccessAccounts"
    ];
  };
  Risk: Record<string, unknown>; // or any specific type you want for Risk
  Links: {
    Self: string;
  };
  Meta: {
    TotalPages: number;
  };
};
