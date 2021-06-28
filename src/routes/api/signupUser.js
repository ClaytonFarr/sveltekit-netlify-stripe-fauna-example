import * as auth from '$lib/apis/auth-api';
import errorResponse from '$lib/utils/errorResponse';

export async function post(request) {
  
  // NOTE - there is a 15 minute default timeout between signup emails
  // 'SMTP_MAX_FREQUENCY' setting @ https://github.com/netlify/gotrue/blob/master/README.md#e-mail

  try {
    // attempt to sign up user
    const { email, password } = request.body;
    const signupUserRequest = await auth.signupUser(email, password);

    // console.log(Date.now(), ': SIGNUP USER endpoint signupUserRequest :', signupUserRequest);

    // throw error if success test fails
    if (!signupUserRequest.ok || signupUserRequest.body.error) throw { status: signupUserRequest.status, message: signupUserRequest.body.error, };

    // else, continue
    return {
      ok: true,
      status: signupUserRequest.status,
      body: {
        email: signupUserRequest.body.email,
      }
    };
      
  } catch (error) {
    return errorResponse(error, 'signupUser');
  }

}