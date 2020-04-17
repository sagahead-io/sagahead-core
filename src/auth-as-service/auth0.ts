import * as auth0 from 'auth0';
import { ConnectionObject } from '.';

export interface Auth0Package {
  access_token: string;
  [key: string]: string;
}

export const authorizeInAuth0 = async (conn: ConnectionObject): Promise<Auth0Package> => {
  try {
    const auth0Authentication = new auth0.AuthenticationClient({
      domain: conn.auth0Domain,
      clientId: conn.auth0ClientId,
      clientSecret: conn.auth0ClientSecret,
    });
    const loginResponse = await auth0Authentication.clientCredentialsGrant({
      audience: conn.auth0Audience,
    });

    if (loginResponse.access_token) {
      return loginResponse as Auth0Package;
    } else {
      throw new Error('Tokens not found');
    }
  } catch (e) {
    throw new Error(e);
  }
};
