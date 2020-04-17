import { authorizeInAuth0 } from './auth0';
import { authorizeInApi } from './graphql';

export * from './auth0';
export * from './graphql';

export interface ConnectionObject {
  apiUrl: string;
  auth0Domain: string;
  auth0Audience: string;
  auth0ClientId: string;
  auth0ClientSecret: string;
}

export interface AuthorizedResponseObject {
  loggedIn: boolean;
}

export let connection: ConnectionObject;

export async function authorizeAsService<I, O extends AuthorizedResponseObject>(
  conn: ConnectionObject
): Promise<boolean> {
  try {
    if (!connection) {
      connection = conn;
    }
    const auth0Package = await authorizeInAuth0(connection);
    return authorizeInApi<I, O>(connection, auth0Package);
  } catch (e) {
    throw new Error(e);
  }
}
