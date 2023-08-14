import axios from "axios";
import qs from "qs";
import {
  AccessToken,
  ApiAccessToken,
  ApprovedConsent,
  AccountInformation,
  TransactionInformation,
  ConsentInformation,
  NatwestOpenBankingConfiguration,
  NatwestOpenIDConfiguration,
} from "./contracts";

export class Accounts {
  private readonly configuration: NatwestOpenBankingConfiguration;

  constructor(configuration: NatwestOpenBankingConfiguration) {
    this.configuration = configuration;
  }

  async retrieveOpenIDConfiguration() {
    const response = await axios<NatwestOpenIDConfiguration>({
      method: "GET",
      url: this.configuration.wellKnownEndpoint,
    });

    return response.data;
  }

  /**
   * Obtain Access Token, so this is Authenticate step
   * requested scope is accounts. This is the scope you require to access account data. Alternative scopes are available.
   * For example payment to access payment services.
   * @param tokenEndpoint
   * @returns
   */
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
        client_id: this.configuration.client_id,
        client_secret: this.configuration.client_secret,
      }),
    });

    return response.data;
  }

  /**
   * Exchanging an Authorization Code for an Access Token
   *
   * In this step the token endpoint is used via an OAuth Hybrid Flow to exchange the authorization code generated during the authorization process for an Access Token
   *
   * @param tokenEndpoint
   * @param code
   * @returns
   */
  async exchangeAuthorizationCodeForApiAccessToken(
    tokenEndpoint: string,
    authorizationCode: string
  ) {
    const grant_type = "authorization_code";

    const response = await axios<ApiAccessToken>({
      method: "POST",
      url: tokenEndpoint,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: qs.stringify({
        grant_type,
        client_id: this.configuration.client_id,
        client_secret: this.configuration.client_secret,
        redirect_uri: this.configuration.redirectUrl,
        code: authorizationCode,
      }),
    });

    return response.data;
  }

  /**
   * Registering an Account Access Consent Request
   * Once authenticated, you must make an HTTP POST request to the account-access-consents endpoint to register your intent
   * to access your account data. This request contains details of the access you wish to obtain to the your account, including:
   * - Data Clusters (or permissions) requested on your accounts. Examples include the ability to read transactions or read balances;
   * - First and last transaction dates and times you would like to access (optional)
   * - Number of days the access will remain valid (defaulted to indefinite if not provided)
   *
   * At the response;
   *  the Account Access Request is in the AwaitingAuthorisation state. It cannot be used until it is confirmed by you.
   *  ConsentId field is synonymous with Account Access Request Id:
   * @param accessToken
   * @returns
   */
  async createAccountAccessConsent(accessToken: string) {
    const response = await axios<ConsentInformation>({
      method: "POST",
      url: `${this.configuration.apiUrlPrefix}/open-banking/v3.1/aisp/account-access-consents`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        Data: {
          Permissions: [
            "ReadAccountsDetail",
            "ReadBalances",
            "ReadBeneficiariesDetail",
            "ReadDirectDebits",
            "ReadProducts",
            "ReadStandingOrdersDetail",
            "ReadTransactionsCredits",
            "ReadTransactionsDebits",
            "ReadTransactionsDetail",
            "ReadScheduledPaymentsDetail",
            "ReadStatementsBasic",
            "ReadStatementsDetail",
            "NWGReadDirectAccessAccounts",
          ],
        },
        Risk: {},
      },
    });

    return response.data;
  }

  async getAccountAccessConsent(accountConsentId: string, accessToken: string) {
    const response = await axios({
      method: "GET",
      url: `${this.configuration.apiUrlPrefix}/open-banking/v3.1/aisp/account-access-consents/${accountConsentId}`,
      headers: {
        "x-fapi-financial-id": this.configuration.x_fapi_financial_id,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  }

  async deleteAccountAccessConsent(
    accountConsentId: string,
    accessToken: string
  ) {
    const response = await axios({
      method: "DELETE",
      url: `${this.configuration.apiUrlPrefix}/open-banking/v3.1/aisp/account-access-consents/${accountConsentId}`,
      headers: {
        "x-fapi-financial-id": this.configuration.x_fapi_financial_id,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  }

  /**
   * Confirming Account Access Consent Request
   *
   * Obtain confirmation for your access consent request
   * @param authorizationEndpoint
   * @param accountConsentId
   * @returns
   */
  async approveAccountAccessConsentRequest(
    authorizationEndpoint: string,
    accountConsentId: string
  ): Promise<ApprovedConsent> {
    const encodedRedirectUrl = encodeURIComponent(
      this.configuration.redirectUrl
    );

    const response = await axios<ApprovedConsent>({
      method: "GET",
      url: `${authorizationEndpoint}?client_id=${this.configuration.client_id}&response_type=code id_token&scope=openid accounts&redirect_uri=${encodedRedirectUrl}&state=ABC&request=${accountConsentId}&authorization_mode=AUTO_POSTMAN&authorization_username=${this.configuration.psuUsername}`,
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

  async listAccounts(apiAccessToken: string) {
    const response = await axios<AccountInformation>({
      method: "GET",
      url: `${this.configuration.apiUrlPrefix}/open-banking/v3.1/aisp/accounts`,
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
      url: `${this.configuration.apiUrlPrefix}/open-banking/v3.1/aisp/accounts/${accountId}/transactions`,
      headers: {
        Authorization: `Bearer ${apiAccessToken}`,
      },
    });

    return response.data;
  }
}
