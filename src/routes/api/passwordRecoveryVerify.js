import * as auth from '$lib/apis/auth-api-methods';
import * as cookie from '$lib/utils/cookies';
import { serverResponse } from '$lib/utils/helpers';

export async function post(request) {

  try {
    const { token } = request.body; // #recovery_token value passed to endpoint
    const data = await auth.verifyPasswordRecovery(token);
    const jwt = data.access_token;

    // if error or missing JWT, throw
    if (data.error || !jwt) {
      throw { statusMessage: data.statusMessage, errorMessage: data.error, };
    }

    // return response that also set identity JWT cookie
    const body = {};
    return cookie.setIdentityCookies(body, jwt);

  } catch (error) {
    let { statusMessage, errorMessage } = error;
    if (errorMessage?.toLowerCase().includes('bad request')) {
      errorMessage = 'Invalid password reset token.'
    }
    return serverResponse(200, false, {
      statusMessage : statusMessage || 'error',
      error: errorMessage || error.message || 'Unknown error',
    });
  }

}