import * as auth from '$lib/apis/auth-api-methods';
import { serverResponse } from '$lib/utils/helpers';

export async function post(request) {
  
  // NOTE - there is a 15 minute default timeout between signup emails
  // 'SMTP_MAX_FREQUENCY' setting @ https://github.com/netlify/gotrue/blob/master/README.md#e-mail

  try {
    const { email, password } = request.body;
    const data = await auth.signupUser(email, password);
    if (data.error) {
      throw { statusMessage: data.statusMessage, errorMessage: data.error, };
    }
    return serverResponse(200, true, {
      email: data.email,
    });

  } catch (error) {
    let { statusMessage, errorMessage } = error;
    if (errorMessage?.toLowerCase().includes('registered')) {
      errorMessage = 'An account for this email already exists.'
    }
    return serverResponse(200, false, {
      statusMessage : statusMessage || 'error',
      error: errorMessage || error.message || 'Unknown error',
    });
  }

}