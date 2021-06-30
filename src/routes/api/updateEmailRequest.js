import * as auth from '$lib/apis/auth-api-methods';
import { serverResponse } from '$lib/utils/helpers';

export async function post(request) {

  // NOTE - there is a 15 minute default timeout between sending 'email change' emails
  // 'SMTP_MAX_FREQUENCY' setting @ https://github.com/netlify/gotrue/blob/master/README.md#e-mail

  try {
    const { token, user } = request.locals;
    const { newEmail, password } = request.body;

    // authorize request
    const accessTokenCheck = await auth.verifyCurrentToken(token); // validate user session    
    if(!accessTokenCheck.ok) throw { statusMessage: 'error', errorMessage: 'Unauthorized Session' };

    const authCheck = await auth.loginUser(user.email, password); // validate user entered password
    if(authCheck.error) throw { statusMessage: authCheck.statusMessage, errorMessage: 'Please double-check current password.' };

    const emailMatch = (accessTokenCheck.email === user.email); // compare returned email to user email in session
    if(!emailMatch) throw { statusMessage: 'error', errorMessage: 'Unauthorized User' };

    if(accessTokenCheck.ok && authCheck && emailMatch) {
    
      // Attempt to start 'update email' process;
      // -------------------------------------------------------------------------------------------
      // if successful, Netlify Identity will send confirmation email to new email address
      const updateEmail = await auth.updateUser(token, { email: newEmail });

      // when an email update request is successful 2 keys are added/updated: 'new_email' & 'email_change_sent_at'
      // - 'new_email' key may already exist if prior email change is still pending;
      // - 'new_email' key is deleted when a pending email change is confirmed;
      // - 'email_change_sent_at' key may already exist if any prior email change event has occurred (is not deleted).
      //
      // example successful return -
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

      // test new email matches requested email address
      const submittedNewEmail = newEmail;
      const responseNewEmail = updateEmail.new_email;
      const isCorrectEmail = submittedNewEmail === responseNewEmail;

      // test email change request is current
      const now = new Date();
      const responseEmailRequestTimestamp = new Date(updateEmail.email_change_sent_at);
      const timestampMsDifference = now.getTime() - responseEmailRequestTimestamp.getTime();
      const isRecentTimestamp = timestampMsDifference/1000 < 60; // within last 60 seconds

      // if either success test fails throw error
      if (!isCorrectEmail || !isRecentTimestamp) throw { statusMessage: updateEmail.statusMessage, errorMessage: 'Unable to update email - please try again.', };

      return serverResponse(200, true, {
        pendingEmail: updateEmail.new_email,
        emailChangeSentAt: updateEmail.email_change_sent_at,
      })

    }
    
  } catch (error) {
    let { statusMessage, errorMessage } = error;
    if (!errorMessage) console.log(new Date().toISOString(), "💥 'updateEmailRequest' endpoint unsuccessful : error.message :", error.message);

    if (errorMessage?.toLowerCase().includes('bad request')) {
      errorMessage = 'We encountered a system error - please try again.'
    }
    if (errorMessage?.toLowerCase().includes('user not found')) {
      errorMessage = 'Please double-check current password.'
    }

    return serverResponse(200, false, {
      statusMessage: statusMessage || 'error',
      error: errorMessage || 'Unsuccessful Request',
    });
  }

}