import * as auth from '$lib/apis/auth-api-methods';
import { serverResponse } from '$lib/utils/helpers';

export async function post(request) {

  // NOTE - there is a 15 minute default timeout between password reset emails
  // 'SMTP_MAX_FREQUENCY' setting @ https://github.com/netlify/gotrue/blob/master/README.md#e-mail

  try {
    const { email } = request.body;
    const data = await auth.requestPasswordRecovery(email);
    if (data.error) {
      throw { statusMessage: data.statusMessage, errorMessage: data.error, };
    }
    return serverResponse(200, true);

  } catch (error) {
    let { statusMessage, errorMessage } = error;
    if (errorMessage?.toLowerCase().includes('user not found')) {
      errorMessage = 'Account not found.'
    }
    return serverResponse(200, false, {
      statusMessage : statusMessage || 'error',
      error: errorMessage || error.message || 'Unknown error',
    });
  }

}