import * as auth from '$lib/apis/auth-api';
import errorResponse from '$lib/utils/errorResponse';

export async function post(request) {

  // NOTE - there is a 15 minute default timeout between password reset emails
  // 'SMTP_MAX_FREQUENCY' setting @ https://github.com/netlify/gotrue/blob/master/README.md#e-mail

  try {

    // request reset password email
    const { email } = request.body;
    const passwordRecoveryRequest = await auth.requestPasswordRecovery(email);

    // console.log(Date.now(), ': REQUEST PASSWORD RECOVERY endpoint passwordRecoveryRequest :', passwordRecoveryRequest);

    // if passwordRecoveryRequest fails throw error
    if (!passwordRecoveryRequest.ok || passwordRecoveryRequest.body.error) throw { status: passwordRecoveryRequest.status, message: passwordRecoveryRequest.body.error, };

    // else, continue
    return {
      ok: true,
      status: passwordRecoveryRequest.status,
      body: passwordRecoveryRequest.body,
    }

  } catch (error) {
    return errorResponse(error, 'passwordRecoveryRequest');
  }

}