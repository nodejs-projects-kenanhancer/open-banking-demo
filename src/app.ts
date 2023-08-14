import { config } from "dotenv";
import { Accounts } from "./natwest";
config();

(async () => {
  const {
    WELL_KNOW_ENDPOINT,
    API_URL_PREFIX,
    CLIENT_ID,
    CLIENT_SECRET,
    PSU_USER_NAME,
    REDIRECT_URL,
    x_FAPI_FINANCIAL_ID,
  } = process.env;

  const natwestOpenBankingAccounts = new Accounts({
    wellKnownEndpoint: WELL_KNOW_ENDPOINT,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    psuUsername: PSU_USER_NAME,
    apiUrlPrefix: API_URL_PREFIX,
    redirectUrl: REDIRECT_URL,
    x_fapi_financial_id: x_FAPI_FINANCIAL_ID,
  });

  const openIdConfiguration =
    await natwestOpenBankingAccounts.retrieveOpenIDConfiguration();

  const { token_endpoint, authorization_endpoint } = openIdConfiguration;

  const accessToken = await natwestOpenBankingAccounts.retrieveAccessToken(
    token_endpoint
  );

  const { access_token } = accessToken;

  const consentInformation =
    await natwestOpenBankingAccounts.createAccountAccessConsent(access_token);

  const createdConsent =
    await natwestOpenBankingAccounts.getAccountAccessConsent(
      consentInformation.Data.ConsentId,
      access_token
    );

  // const deletedAccountAccessToken =
  //   await natwestOpenBankingAccounts.deleteAccountAccessConsent(
  //     consentInformation.Data.ConsentId,
  //     access_token
  //   );

  const approvedConsent =
    await natwestOpenBankingAccounts.approveAccountAccessConsentRequest(
      authorization_endpoint,
      consentInformation.Data.ConsentId
    );

  const apiAccessToken =
    await natwestOpenBankingAccounts.exchangeAuthorizationCodeForApiAccessToken(
      token_endpoint,
      approvedConsent.code
    );

  const accounts = await natwestOpenBankingAccounts.listAccounts(
    apiAccessToken.access_token
  );

  const transactions = await natwestOpenBankingAccounts.listTransactions(
    apiAccessToken.access_token,
    accounts.Data.Account[0].AccountId
  );

  console.log(`token_endpoint: ${token_endpoint}`);

  console.log(`access_token: ${access_token}`);

  console.log(`ConsentId: ${consentInformation.Data.ConsentId}`);

  console.log(`Created Consent: `, createdConsent);

  console.log(approvedConsent.redirectUri);

  console.log(`api access_token: ${apiAccessToken.access_token}`);

  console.log("accounts:", accounts.Data.Account);

  console.log("transactions:", transactions.Data.Transaction);
})();
