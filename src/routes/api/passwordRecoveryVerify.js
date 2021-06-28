import * as auth from '$lib/apis/auth-api';
import errorResponse from '$lib/utils/errorResponse';

export async function post(request) {

  try {

    // attempt to confirm recovery token
    const { token } = request.body; // #recovery_token value passed to endpoint
    const recoveryTokenCheck = await auth.verifyPasswordRecovery(token);

    // console.log(Date.now(), ': VERIFY PASSWORD RECOVERY endpoint recoveryTokenCheck :', recoveryTokenCheck);

    // if recoveryTokenCheck fails throw error
    if (!recoveryTokenCheck.ok || recoveryTokenCheck.body.error) throw { status: recoveryTokenCheck.status, message: recoveryTokenCheck.body.error, };

    // if access token doesn't exist in response throw error
    const jwt = recoveryTokenCheck.body.access_token;
    if (!jwt) throw { status: recoveryTokenCheck.status, message: recoveryTokenCheck.body.error, };
    
    // else, continue
    const body = {};
    return auth.setIdentityCookies(recoveryTokenCheck.status, body, jwt);

  } catch (error) {
    return errorResponse(error, 'passwordRecoveryVerify');
  }

}