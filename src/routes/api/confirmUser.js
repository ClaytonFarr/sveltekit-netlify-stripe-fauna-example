import * as auth from '$lib/apis/auth-api-methods';
import * as db from '$lib/apis/db-api-methods'
import * as cookie from '$lib/utils/cookies';
import { serverResponse, parseJwt } from '$lib/utils/helpers';

export async function post(request) {

  try {
    const { token } = request.body; // #confirmation_token value passed to endpoint
    const data = await auth.confirmUser(token);
    const jwt = data.access_token;

    // if error or missing JWT, throw
    if (data.error || !jwt) {
      throw { statusMessage: data.statusMessage, errorMessage: data.error, };
    }

    // grab tokens and claims
    const jwtPayload = parseJwt(jwt);
    const refreshToken = data.refresh_token;
    const netlifyId = jwtPayload.sub;
    const body = {
      user: {
        authenticated: true,
        authExpires: jwtPayload.exp,
        id: jwtPayload.sub,
        email: jwtPayload.email,
      }
    }

    // update user's refresh token on successful login
    await db.saveRefreshToken(netlifyId, refreshToken);
    // return response that also set identity JWT cookie
    return cookie.setIdentityCookies(body, jwt);

  } catch (error) {
    let { statusMessage, errorMessage } = error;
    if (errorMessage?.toLowerCase().includes('bad request')) {
      errorMessage = 'Unable to Confirm Account'
    }
    return serverResponse(200, false, {
      statusMessage : statusMessage || 'error',
      error: errorMessage || error.message || 'Unknown error',
    });
  }

}