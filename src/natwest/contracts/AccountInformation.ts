import { AccountDetails } from "./AccountDetails";

export type AccountInformation = {
  Data: {
    Account: AccountDetails[];
  };
  Links: {
    Self: string;
  };
  Meta: {
    TotalPages: number;
  };
};
