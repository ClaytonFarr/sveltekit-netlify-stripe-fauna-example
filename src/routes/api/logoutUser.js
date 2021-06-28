import * as auth from '$lib/apis/auth-api';
import * as db from '$lib/apis/db-api';
import errorResponse from '$lib/utils/errorResponse';

export async function post(request) {

  try {

    // attempt to revoke refresh token from Netlify Identity
    const { token } = request.locals;
    const logoutUserRequest = await auth.logoutUser(token);

    // console.log(Date.now(), ': LOGOUT endpoint logoutUserRequest :', logoutUserRequest);

    // can log results on server; logoutUserRequest failure does not prevent subsequent steps
    if (!logoutUserRequest.ok || logoutUserRequest.body.error)
      console.log('💥 LOGOUT Unsuccessful - ', logoutUserRequest); 
    //   else console.log('✅ LOGOUT Successful - ', logoutUserRequest);

    // clear saved refresh token in user database
    const netlifyId = request.locals.user.sub;
    await db.deleteRefreshToken(netlifyId); // if attempt fails db.deleteRefreshToken() method will report error on server

    // clear cookies
    const body = {};
    return auth.deleteIdentityCookies(logoutUserRequest.status, body);

  } catch (error) {
    return errorResponse(error, 'logoutUser');
  }
}