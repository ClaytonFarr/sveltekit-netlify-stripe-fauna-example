import * as auth from '$lib/apis/auth-api';
import { parseJwt } from '$lib/utils/helpers';
import verifyCurrentToken from '$lib/utils/verifyCurrentToken';
import errorResponse from '$lib/utils/errorResponse';

export async function post(request) {

  // NOTE - there is a 15 minute default timeout between sending 'email change' emails
  // 'SMTP_MAX_FREQUENCY' setting @ https://github.com/netlify/gotrue/blob/master/README.md#e-mail

  try {
    const { token, user } = request.locals;
    const { newEmail, password } = request.body;

    // authorize request
    const accessTokenCheck = await verifyCurrentToken(token); // validate user session    
    const authCheck = await auth.loginUser(user.email, password); // validate user entered password
    const authCheckEmail = authCheck.body.access_token ? parseJwt(authCheck.body.access_token).email : null; // retrieve validated email
    const emailMatch = (authCheckEmail === user.email); // compare returned email to user email in session

    if(accessTokenCheck.ok && authCheck && emailMatch) {
    
      // attempt to start 'update email' process;
      // (if successful, NI will send confirmation email to new address)
      const updateEmailRequest = await auth.updateUser(token, { email: newEmail });

      // console.log(Date.now(), ': UPDATE EMAIL endpoint updateEmailRequest :', updateEmailRequest);

      // When an email update request is successful 2 keys are added/updated: 'new_email' & 'email_change_sent_at'
      // - 'new_email' key may already exist if prior email change is still pending;
      // - 'new_email' key is deleted when a pending email change is confirmed;
      // - 'email_change_sent_at' key may already exist if any prior email change event has occurred (is not deleted).
      //
      // Example successful return -
      // 
      // { "id": "some-id-value",
      //   "aud": "",
      //   "role": "",
      //   "email": "name@domain.com",
      //   "confirmed_at": "2021-01-01T01:00:00Z",
      //   "confirmation_sent_at": "2021-01-01T01:00:00Z",
      //   "new_email": "newname@newdomain.com",
      //   "email_change_sent_at": "2021-01-01T01:00:00.000000001Z",
      //   "app_metadata": { "provider": "email" },
      //   "user_metadata": {},
      //   "created_at": "2021-01-01T01:00:00Z",
      //   "updated_at": "2021-01-01T01:00:00.000001Z" }

      // Test new email matches requested email address
      const submittedNewEmail = newEmail;
      const responseNewEmail = updateEmailRequest.body.new_email;
      const isCorrectEmail = submittedNewEmail === responseNewEmail;

      // Test email change request is current
      const now = new Date();
      const responseEmailRequestTimestamp = new Date(updateEmailRequest.body.email_change_sent_at);
      const timestampMsDifference = now.getTime() - responseEmailRequestTimestamp.getTime();
      const isRecentTimestamp = timestampMsDifference/1000 < 60; // within last 60 seconds

      // throw error if either success test fails
      if (!isCorrectEmail || !isRecentTimestamp) throw { status: 500, message: 'Unable to update email - please try again.', };

      // else, continue
      return {
        ok: true,
        status: updateEmailRequest.status,
        body: {
          pendingEmail: updateEmailRequest.body.new_email,
          emailChangeSentAt: updateEmailRequest.body.email_change_sent_at,
        }
      };

    } else {
      throw { status: authCheck.status || 401, message: authCheck.body.error || 'Unauthorized request.', };
    }
    
  } catch (error) {
    return errorResponse(error, 'updateEmailRequest');
  }

}