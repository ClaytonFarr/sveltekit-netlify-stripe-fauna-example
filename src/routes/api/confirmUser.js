import * as auth from '$lib/apis/auth-api';
import * as db from '$lib/apis/db-api'
import { parseJwt } from '$lib/utils/helpers'
import errorResponse from '$lib/utils/errorResponse'

export async function post(request) {

  try {

    // attempt to confirm signup token
    const { token } = request.body; // #confirmation_token value passed to endpoint
    const signupTokenCheck = await auth.confirmUser(token);

    // console.log(Date.now(), ': CONFIRM endpoint signupTokenCheck :', signupTokenCheck);

    // if signupTokenCheck fails throw error
    if (!signupTokenCheck.ok || signupTokenCheck.body.error) throw { status: signupTokenCheck.status, message: signupTokenCheck.body.error, };

    // if access token doesn't exist in response throw error
    const jwt = signupTokenCheck.body.access_token;
    if (!jwt) throw { status: signupTokenCheck.status, message: signupTokenCheck.body.error, };

    // grab tokens and claims
    const jwtPayload = parseJwt(jwt);
    const refreshToken = signupTokenCheck.body.refresh_token;
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

    // set user's identity JWT cookie
    return auth.setIdentityCookies(signupTokenCheck.status, body, signupTokenCheck.body.access_token);

  } catch (error) {
    // TODO: add information for UI to handle failure gracefully
    return errorResponse(error, 'confirmUser');
  }

}