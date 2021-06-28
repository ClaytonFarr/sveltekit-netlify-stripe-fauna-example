import * as auth from '$lib/apis/auth-api';
import * as db from '$lib/apis/db-api';
import errorResponse from '$lib/utils/errorResponse';
import { parseJwt } from '$lib/utils/helpers';

export async function post(request) {

  try {

    // attempt to log in user
    const { email, password } = request.body;
    const loginUserRequest = await auth.loginUser(email, password);

    // console.log(Date.now(), ': LOGIN USER endpoint loginUserRequest :', loginUserRequest);

    // if loginUserRequest fails throw error
    if (!loginUserRequest.ok || loginUserRequest.body.error) throw { status: loginUserRequest.status, message: loginUserRequest.body.error, };
    // else, continue

    // if access token doesn't exist in response throw error
    const jwt = loginUserRequest.body.access_token;
    if (!jwt) throw { status: loginUserRequest.status, message: loginUserRequest.body.error, };

    // grab tokens and claims
    const jwtPayload = parseJwt(jwt);
    const refreshToken = loginUserRequest.body.refresh_token;
    const netlifyId = jwtPayload.sub;
    const body = {
      user: {
        authenticated: true,
        authExpires: jwtPayload.exp,
        id: jwtPayload.sub,
        email: jwtPayload.email,
      }
    }

    // update user's refresh token
    await db.saveRefreshToken(netlifyId, refreshToken); // if attempt fails db.saveRefreshToken() method will report error on server

    // set user's identity JWT cookie
    return auth.setIdentityCookies(loginUserRequest.status, body, loginUserRequest.body.access_token);

  } catch (error) {
    return errorResponse(error, 'loginUser');
  }

}