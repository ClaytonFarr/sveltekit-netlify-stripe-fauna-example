import * as auth from '$lib/apis/auth-api';
import * as db from '$lib/apis/db-api'
import verifyCurrentToken from '$lib/utils/verifyCurrentToken';
import errorResponse from '$lib/utils/errorResponse';

export async function post(request) {

  try {
    // access token can come from two places
    // from request.locals when endpoint is called from client (.svelte file) and hooks.js hydrates request.locals from JWT cookie
    // passed in request.body when endpoint is called from another endpoint (.js file)
    const token = request.locals.token ? request.locals.token : request.body.token || null;
        
    // authorize request
    const accessTokenCheck = await verifyCurrentToken(token);

    // console.log(Date.now(), ': REFRESH TOKEN endpoint accessTokenCheck :', accessTokenCheck);

    if(accessTokenCheck.ok) {

      // attempt to request new tokens
      // -------------------------------------------------------------------------------------------
      const netlifyId = accessTokenCheck.body?.id;
      const previousRefreshToken = await db.getRefreshToken(netlifyId);
      const newTokensRequest = await auth.requestNewAccessToken(previousRefreshToken);
      // a valid newTokensRequest will return an object that includes an access_token
      // an invalid newTokensRequest will return 400 with 'error_description' message
      // if newTokensRequest fails, throw error
      if (!newTokensRequest.body?.access_token || newTokensRequest.body?.error_description) throw { status: newTokensRequest.status, message: newTokensRequest.body?.error_description, };
      // else, continue

      // attempt to replace used refresh token
      // -------------------------------------------------------------------------------------------
      const newRefreshToken = newTokensRequest.body?.refresh_token;
      await db.saveRefreshToken(netlifyId, newRefreshToken);
      
      // return new access token
      // -------------------------------------------------------------------------------------------
      const newAccessToken = newTokensRequest.body?.access_token;
      return {
        ok: true,
        status: 200,
        body: { token: newAccessToken }
      };

    } else {
      throw { status: 401, message: 'Unauthorized Request', };
    }

  } catch (error) {
    return errorResponse(error, 'refreshToken');
  }

}