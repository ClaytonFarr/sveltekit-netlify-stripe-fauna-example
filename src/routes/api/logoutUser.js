import * as auth from '$lib/apis/auth-api-methods';
import * as db from '$lib/apis/db-api-methods';
import * as cookie from '$lib/utils/cookies';
import { serverResponse } from '$lib/utils/helpers';

export async function post(request) {

  try {
    const { token } = request.locals;
    const data = await auth.logoutUser(token);

    if (data.error) {
      // log results on server; logoutUserRequest failure does not prevent subsequent steps
      console.log(new Date().toISOString(), '💥 LOGOUT unsuccessful :', data);
    }

    // clear saved refresh token in user database
    const netlifyId = request.locals.user.sub;
    await db.deleteRefreshToken(netlifyId);
    // return response that clears user's identity JWT cookie
    const body = {};
    return cookie.deleteIdentityCookies(body);

  } catch (error) {
    let { statusMessage, errorMessage } = error;
    if (!errorMessage) console.log(new Date().toISOString(), "💥 'logoutUser' endpoint unsuccessful : error.message :", error.message);

    return serverResponse(200, false, {
      statusMessage: statusMessage || 'error',
      error: errorMessage || 'Unsuccessful Request',
    });
  }
}