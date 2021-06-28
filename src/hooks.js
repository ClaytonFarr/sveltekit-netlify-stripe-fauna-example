import { parseIdentityCookies } from '$lib/apis/auth-api'
import { parseJwt } from '$lib/utils/helpers'


// ==============================================================================
// HANDLE
// ==============================================================================

export async function handle({ request, resolve }) {

  // console.log('=============================================================');
  // console.log(Date.now(), ': HOOKS handle');

  // parse jwt from cookie in request, if present, and populate locals.user
  const { jwt } = parseIdentityCookies(request);
  if (jwt) {
    request.locals.token = jwt;
    request.locals.user = parseJwt(jwt);
  }
  if (request.locals.user) {
    request.locals.user.authenticated = true;
  } else {
    request.locals.user = {};
    request.locals.user.authenticated = false;
  }
  
  // console.log(Date.now(), ': HOOKS handle jwt :', jwt);
  // console.log(Date.now(), ': HOOKS handle locals.user.authenticated :', request.locals.user.authenticated);

  // process requested route/endpoint
  const response = await resolve(request);

  return {
    ...response,
    headers: {
      ...response.headers,
      // 'x-custom-header': 'potato',
    }
  };

}


// ==============================================================================
// GETSESSION
// ==============================================================================

export function getSession(request) {

  // console.log('-------------------------------------------------------------');
  // console.log(Date.now(), ': HOOKS getSession');
  // console.log(Date.now(), ': HOOKS getSession locals.user.authenticated :', request.locals.user.authenticated);
  
  return {
    user: {
			authenticated: request.locals.user.authenticated || false,
			authExpires: request.locals.user.exp || null,
			email: request.locals.user.email || null,
		}
	};
}
