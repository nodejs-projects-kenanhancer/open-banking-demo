export type ApprovedConsent = {
  redirectUri: string;
  /**
   * Authorization Code
   */
  code: string;
  id_token: string;
  state: string;
};
