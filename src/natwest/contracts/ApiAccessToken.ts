import { AccessToken } from "./AccessToken";

export type ApiAccessToken = AccessToken & {
  refresh_token: string;
  id_token: string;
};
