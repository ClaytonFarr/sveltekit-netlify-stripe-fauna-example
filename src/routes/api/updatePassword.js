import * as auth from '$lib/apis/auth-api';
import { parseJwt } from '$lib/utils/helpers';
import verifyCurrentToken from '$lib/utils/verifyCurrentToken';
import errorResponse from '$lib/utils/errorResponse';

export async function post(request) {

  try {
    const { token, user } = request.locals;
    const { currentPassword, newPassword } = request.body;
    
    // authorize request
    const accessTokenCheck = await verifyCurrentToken(token); // validate user session
    const authCheck = await auth.loginUser(user.email, currentPassword); // validate user entered password
    const authCheckEmail = authCheck.body.access_token ? parseJwt(authCheck.body.access_token).email : null; // retrieve validated email
    const emailMatch = (authCheckEmail === user.email); // compare returned email to user email in session
    
    if(accessTokenCheck.ok && authCheck && emailMatch) {
    
      // attempt to update password
      const updatePasswordRequest = await auth.updateUser(token, { password: newPassword });

      // console.log(Date.now(), ': UPDATE PASSWORD endpoint updatePasswordRequest :', updatePasswordRequest);

      // There does not seem to be an explicit response from Netlify 
      // Identity when a user value has been succesfully updated. 
      // On success, the standard user object is returned; e.g. -
      // 
      // { "id": "some-id-value",
      //   "aud": "",
      //   "role": "",
      //   "email": "name@domain.com",
      //   "confirmed_at": "2021-01-01T01:00:00Z",
      //   "confirmation_sent_at": "2021-01-01T01:00:00Z",
      //   "app_metadata": { "provider": "email" },
      //   "user_metadata": {},
      //   "created_at": "2021-01-01T01:00:00Z",
      //   "updated_at": "2021-01-01T01:00:00.000001Z" }

      // Currently testing for success implicitly via updatePasswordRequest.ok
      // and existence of 'email' in response object

      if (updatePasswordRequest.ok && updatePasswordRequest.body.email) {
        return {
          ok: true,
          status: updatePasswordRequest.status,
          body: {
            accountEmail: updatePasswordRequest.body.email,
          }
        }
      }
    } else {
      throw { status: authCheck.status || 401, message: authCheck.body.error || 'Unauthorized request.', };
    }

  } catch (error) {
    return errorResponse(error, 'updatePassword');
  }

}