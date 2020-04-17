import 'cross-fetch/polyfill';
import ApolloClient, { OperationVariables, DocumentNode } from 'apollo-boost';
import { Auth0Package } from './auth0';
import gql from 'graphql-tag';
import { ConnectionObject, authorizeAsService, connection } from '.';

const LOGIN = gql`
  mutation LoginMutation($input: GatewayLoginInput!) {
    login(input: $input) {
      loggedIn
    }
  }
`;

let client: ApolloClient<any>;

const setupClient = (apiUrl: string, auth0Package: Auth0Package): ApolloClient<any> => {
  client = new ApolloClient({
    uri: apiUrl,
    request: operation => {
      operation.setContext({
        headers: {
          authorization: `Bearer ${auth0Package.access_token.replace(/"/g, '')}`,
        },
      });
    },
  });
  return client;
};

const requestWithReconnect = async <T>(err: Error, cb: () => Promise<T>): Promise<T> => {
  if (JSON.stringify(err).indexOf('Unauthorized') > -1) {
    try {
      await authorizeAsService(connection);
      const data = await cb();
      return data;
    } catch (e) {
      throw new Error(`Failed to reauthorize ${e}`);
    }
  }

  throw new Error(`${err}`);
};

export const query = async <T = any, V = OperationVariables>(query: DocumentNode): Promise<T> => {
  const doRequest = async () => {
    const result = await client.query<T, V>({ query });
    return result.data;
  };

  try {
    const data = await doRequest();
    return data;
  } catch (error) {
    return requestWithReconnect<T>(error, doRequest);
  }
};

export const mutate = async <T = any, V = OperationVariables>(
  mutation: DocumentNode,
  variables: any = {}
): Promise<T> => {
  const doRequest = async () => {
    const result = await client.mutate<T, V>({ mutation, variables });

    if (result.data) {
      return result.data;
    }

    throw new Error(`Data not found in result ${result}`);
  };

  try {
    const data = await doRequest();
    return data;
  } catch (error) {
    return requestWithReconnect<T>(error, doRequest);
  }
};

export const authorizeInApi = async <I, O extends { loggedIn: boolean }>(
  conn: ConnectionObject,
  auth0Package: Auth0Package
): Promise<boolean> => {
  return new Promise(resolve => {
    setupClient(conn.apiUrl, auth0Package);

    mutate<{ login: O }, I>(LOGIN, {
      input: {
        accessToken: auth0Package.access_token,
      },
    })
      .then(result => {
        resolve(result.login.loggedIn);
      })
      .catch(() => setTimeout(() => resolve(authorizeInApi(conn, auth0Package)), 2000));
  });
};
