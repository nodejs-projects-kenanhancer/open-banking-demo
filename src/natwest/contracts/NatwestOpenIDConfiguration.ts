export class NatwestOpenIDConfiguration {
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
