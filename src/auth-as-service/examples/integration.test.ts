import { authorizeAsService, query } from '../index';
import gql from 'graphql-tag';

describe('authorizeAsService', () => {
  it('should work', async () => {
    await authorizeAsService({
      apiUrl: 'http://localhost:3000/graphql',
      auth0Audience: 'api-gateway',
      auth0Domain: '< add >',
      auth0ClientId: '< add >',
      auth0ClientSecret: '< add >',
    });

    const r = await query(gql`
      query MeQuery {
        me {
          id
        }
      }
    `);

    expect(r).toBeTruthy();
  });
});
