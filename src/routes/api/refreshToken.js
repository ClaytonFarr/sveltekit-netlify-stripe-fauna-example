import * as auth from '$lib/apis/auth-api-methods';
import * as db from '$lib/apis/db-api-methods'
import { serverResponse } from '$lib/utils/helpers';

export async function post(request) {

  try {

    // access token can come from two places
    // 1) from request.locals when endpoint is called from client (.svelte file) and hooks.js hydrates request.locals from JWT cookie
    // 2) passed in request.body when endpoint is called from another endpoint (.js file)
    const token = request.locals.token ? request.locals.token : request.body.token || null;

    const accessTokenCheck = await auth.verifyCurrentToken(token);
    if(!accessTokenCheck.ok) throw { statusMessage: 'error', errorMessage: 'Unauthorized Session' };

    if(accessTokenCheck.ok) {

      // Attempt to request new tokens
      // -------------------------------------------------------------------------------------------
      const netlifyId = accessTokenCheck.id;
      const previousRefreshToken = await db.getRefreshToken(netlifyId);
      const data = await auth.requestNewAccessToken(previousRefreshToken);

      // a valid response will return an object that includes an access_token
      // an invalid data will return 400 with 'error' message
      if (!data.access_token || data.error) throw { statusMessage: data.statusMessage, errorMessage: data.error, };

      // Attempt to replace used refresh token
      // -------------------------------------------------------------------------------------------
      const newRefreshToken = data.refresh_token;
      await db.saveRefreshToken(netlifyId, newRefreshToken);
      
      // Return new access token
      // -------------------------------------------------------------------------------------------
      return serverResponse(200, true, {
        token: data.access_token,
      })

    }

  } catch (error) {
    let { statusMessage, errorMessage } = error;
    if (!errorMessage) console.log(new Date().toISOString(), "💥 'refreshToken' endpoint unsuccessful : error.message :", error.message);
    
    if (errorMessage?.toLowerCase().includes('invalid refresh token')) {
      errorMessage = 'Unable to renew tokens.'
    }

    return serverResponse(200, false, {
      statusMessage: statusMessage || 'error',
      error: errorMessage || 'Unsuccessful Request',
    });
  }

}