import { AuthChecker, ResolverData } from 'type-graphql';
import createLogger from '../../../logger/src';
import { AuthGuardContext, AuthGuardAuthedAccountData } from './types';

export const authGuard = async <T extends AuthGuardContext>(
  serviceName: string
): Promise<AuthChecker<T>> => {
  return new Promise(resolve => {
    const logger = createLogger({
      customPrefixes: [serviceName],
      serviceInstanceId: serviceName,
    });
    resolve(({ context }: ResolverData<T>, providedRoles?: string[]) => {
      const isAuthorized = !!context.req.headers['x-authorized'];
      const roles = !!context.req.headers['x-roles']
        ? context.req.headers['x-roles'].split(',')
        : [];
      const id = context.req.headers['x-account-id'];
      const auth0Id = context.req.headers['x-account-auth0-id'];
      const token =
        context.req.headers['authorization'] &&
        context.req.headers['authorization'].split('Bearer ')[1];

      if (!token) {
        logger.error(`User has no authorization token`);
        return false;
      }

      if (!isAuthorized || (providedRoles.length && !roles) || !id || !auth0Id) {
        logger.error(`User is not authorized, roles not found or id, auth0id not found.`);
        return false;
      }

      if (providedRoles.length && !roles.some((role: string) => providedRoles.includes(role))) {
        logger.error(`Roles is required for this resource but user does not have required ones.`);
        return false;
      }

      const authedAccount: AuthGuardAuthedAccountData = {
        id: +id || 0,
        auth0Id,
        roles,
        isAuthorized,
        token,
      };

      context.authedAccount = authedAccount;

      return true;
    });
  });
};
