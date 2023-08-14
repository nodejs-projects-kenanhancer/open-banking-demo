import axios from "axios";
import qs from "qs";

class NatwestOpenIDConfiguration {
  version: string;
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  jwks_uri: string;
  registration_endpoint: string;
  scopes_supported: string[];
  claims_supported: string[];
  acr_values_supported: string[];
  response_types_supported: string[];
  response_modes_supported: string[];
  grant_types_supported: string[];
  subject_types_supported: string[];
  id_token_signing_alg_values_supported: string[];
  token_endpoint_auth_methods_supported: string[];
  token_endpoint_auth_signing_alg_values_supported: string[];
  claim_types_supported: string[];
  claims_parameter_supported: boolean;
  request_parameter_supported: boolean;
  request_uri_parameter_supported: boolean;
  request_object_signing_alg_values_supported: string[];
  request_object_encryption_alg_values_supported: any[];
  request_object_encryption_enc_values_supported: any[];
  tls_client_certificate_bound_access_tokens: boolean;
}

class AccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

type ConsentInformation = {
  Data: {
    ConsentId: string;
    CreationDateTime: string;
    Status: string;
    StatusUpdateDateTime: string;
    Permissions: [
      | "ReadAccountsDetail"
      | "ReadBalances"
      | "ReadTransactionsCredits"
      | "ReadTransactionsDebits"
      | "ReadTransactionsDetail"
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

type ApprovedConsent = {
  redirectUri: string;
  code: string;
  id_token: string;
  state: string;
};

type ApiAccessToken = AccessToken & {
  refresh_token: string;
  id_token: string;
};

// AccountInformation
type AccountData = {
  SchemeName: string;
  Identification: string;
  Name: string;
};

type AccountDetails = {
  AccountId: string;
  Currency: string;
  AccountType: string;
  AccountSubType: string;
  Description: string;
  Nickname: string;
  Account: AccountData[];
};

type AccountInformation = {
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

// TransactionInformation
type AmountDetails = {
  Amount: string;
  Currency: string;
};

type TransactionDetails = {
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

type TransactionInformation = {
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

class NatwestOpenBanking {
  realmName = "NatWest";
  apiUrlPrefix = "https://ob.sandbox.natwest.com";
  wellKnownEndpoint =
    "https://api.sandbox.natwest.com/.well-known/openid-configuration";
  redirectUrl =
    "https://4e89d74b-617d-4f2c-9103-41d411bdda24.example.org/redirect";
  client_id: string;
  client_secret: string;
  psuUsername: string;

  constructor(client_id: string, client_secret: string, psuUsername: string) {
    this.client_id = client_id;
    this.client_secret = client_secret;
    this.psuUsername = psuUsername;
  }

  async retrieveOpenIDConfiguration() {
    const response = await axios<NatwestOpenIDConfiguration>({
      method: "GET",
      url: this.wellKnownEndpoint,
    });

    return response.data;
  }

  async retrieveAccessToken(tokenEndpoint: string) {
    const grant_type = "client_credentials";
    const scope = "accounts";

    const response = await axios<AccessToken>({
      method: "POST",
      url: tokenEndpoint,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: qs.stringify({
        grant_type,
        scope,
        client_id: this.client_id,
        client_secret: this.client_secret,
      }),
    });

    return response.data;
  }

  async createAccountRequest(accessToken: string) {
    const response = await axios<ConsentInformation>({
      method: "POST",
      url: `${this.apiUrlPrefix}/open-banking/v3.1/aisp/account-access-consents`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        Data: {
          Permissions: [
            "ReadAccountsDetail",
            "ReadBalances",
            "ReadTransactionsCredits",
            "ReadTransactionsDebits",
            "ReadTransactionsDetail",
          ],
        },
        Risk: {},
      },
    });

    return response.data;
  }

  async approveConsent(
    authorizationEndpoint: string,
    accountConsentId: string
  ): Promise<ApprovedConsent> {
    const encodedRedirectUrl = encodeURIComponent(this.redirectUrl);

    const response = await axios<ApprovedConsent>({
      method: "GET",
      url: `${authorizationEndpoint}?client_id=${this.client_id}&response_type=code id_token&scope=openid accounts&redirect_uri=${encodedRedirectUrl}&state=ABC&request=${accountConsentId}&authorization_mode=AUTO_POSTMAN&authorization_username=${this.psuUsername}`,
    });

    const { redirectUri } = response.data;

    const splittedUri = redirectUri.split("#");
    const queryParams = splittedUri[splittedUri.length - 1];
    const splittedQueryParams = queryParams.split("&");
    const [codeStr, id_tokenStr, stateStr] = splittedQueryParams;

    const [codeField, code] = codeStr.split("=");
    if (codeField === "error") {
      throw new Error(code);
    }

    const [idTokenField, id_token] = id_tokenStr.split("=");
    if (idTokenField === "error") {
      throw new Error(idTokenField);
    }

    const [stateStrField, state] = stateStr.split("=");
    if (stateStrField === "error") {
      throw new Error(stateStrField);
    }

    return { redirectUri, code, id_token, state };
  }

  async exchangeCodeForApiAccessToken(tokenEndpoint: string, code: string) {
    const grant_type = "authorization_code";

    const response = await axios<ApiAccessToken>({
      method: "POST",
      url: tokenEndpoint,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: qs.stringify({
        grant_type,
        client_id: this.client_id,
        client_secret: this.client_secret,
        redirect_uri: this.redirectUrl,
        code,
      }),
    });

    return response.data;
  }

  async listAccounts(apiAccessToken: string) {
    const response = await axios<AccountInformation>({
      method: "GET",
      url: `${this.apiUrlPrefix}/open-banking/v3.1/aisp/accounts`,
      headers: {
        // "Content-Type": "application/json",
        Authorization: `Bearer ${apiAccessToken}`,
      },
    });

    return response.data;
  }

  async listTransactions(apiAccessToken: string, accountId: string) {
    const response = await axios<TransactionInformation>({
      method: "GET",
      url: `${this.apiUrlPrefix}/open-banking/v3.1/aisp/accounts/${accountId}/transactions`,
      headers: {
        // "Content-Type": "application/json",
        Authorization: `Bearer ${apiAccessToken}`,
      },
    });

    return response.data;
  }
}

(async () => {
  const client_id = "Y70E0jcW7dxQh7sdHuDKNN3MXoiWzg5WXSm9v_4tbgU=";
  const client_secret = "WJ5w1i5t1JGQy8ulnGAkNSisU_j59PE4l6W34gyiL9k=";
  const psuUsername =
    "123456789012@4e89d74b-617d-4f2c-9103-41d411bdda24.example.org";

  const natwestOpenBanking = new NatwestOpenBanking(
    client_id,
    client_secret,
    psuUsername
  );

  const openIdConfiguration =
    await natwestOpenBanking.retrieveOpenIDConfiguration();

  const accessToken = await natwestOpenBanking.retrieveAccessToken(
    openIdConfiguration.token_endpoint
  );

  const consentInformation = await natwestOpenBanking.createAccountRequest(
    accessToken.access_token
  );

  const approvedConsent = await natwestOpenBanking.approveConsent(
    openIdConfiguration.authorization_endpoint,
    consentInformation.Data.ConsentId
  );

  const apiAccessToken = await natwestOpenBanking.exchangeCodeForApiAccessToken(
    openIdConfiguration.token_endpoint,
    approvedConsent.code
  );

  const accounts = await natwestOpenBanking.listAccounts(
    apiAccessToken.access_token
  );

  const transactions = await natwestOpenBanking.listTransactions(
    apiAccessToken.access_token,
    accounts.Data.Account[0].AccountId
  );

  console.log(openIdConfiguration.token_endpoint);

  console.log(accessToken.access_token);

  console.log(consentInformation.Data.ConsentId);

  console.log(approvedConsent.redirectUri);

  console.log(apiAccessToken.access_token);

  console.log(accounts.Data.Account);

  console.log(transactions.Data.Transaction);
})();
