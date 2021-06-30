import * as http from '$lib/utils/http-methods';
import * as auth from '$lib/apis/auth-api-methods';
import * as db from '$lib/apis/db-api-methods';
import * as cookie from '$lib/utils/cookies';
import loadStripe from 'stripe';
import { serverResponse } from '$lib/utils/helpers';

export async function post(request) {

  try {
    const { token } = request.locals;
    const accessTokenCheck = await auth.verifyCurrentToken(token);
    if(!accessTokenCheck.ok) throw { statusMessage: 'error', errorMessage: 'Unauthorized Session' };

    if(accessTokenCheck.ok) {

      // Attempt to confirm email change token
      // -------------------------------------------------------------------------------------------
      const { updateToken } = request.body; // #email_change_token value passed to endpoint
      const emailConfirmation = await auth.confirmEmailChange(token, updateToken);
      if (emailConfirmation.error) throw { statusMessage: emailConfirmation.statusMessage, errorMessage: emailConfirmation.error, };

      // when an email change has been successfully *requested* previously a 'email_change_sent_at' key is present
      // when an email change has been successfully *confirmed* the 'new_email' key is deleted
      //
      // example successful return -
      // 
      // { "id": "some-id-value",
      //   "aud": "",
      //   "role": "",
      //   "email": "name@domain.com",
      //   "confirmed_at": "2021-01-01T01:00:00Z",
      //   "confirmation_sent_at": "2021-01-01T01:00:00Z",
      //   "email_change_sent_at": "2021-01-01T01:00:00.000000001Z",
      //   "app_metadata": { "provider": "email" },
      //   "user_metadata": {},
      //   "created_at": "2021-01-01T01:00:00Z",
      //   "updated_at": "2021-01-01T01:00:00.000001Z" }

      // currently testing for success implicitly via confirmEmailChangeToken.ok,
      // existence of 'email_change_sent_at' and absence of 'new_email'.

      const emailChangeRequested = emailConfirmation.email_change_sent_at;
      const emailChangeConfirmed = !emailConfirmation.new_email;
      const identityEmailUpdated = (emailChangeRequested && emailChangeConfirmed);
      if (!identityEmailUpdated) throw { statusMessage: emailConfirmation.statusMessage, errorMessage: 'Unable to update email address.', };
      
      // Attempt to update email in Stripe
      // -------------------------------------------------------------------------------------------
      const netlifyId = accessTokenCheck.id;
      const newEmail = emailConfirmation.email;
      const stripeId = await db.getStripeId(netlifyId);
      const stripe = await loadStripe(process.env['STRIPE_SECRET_KEY']);
      let updateStripeEmail;
      if(netlifyId && newEmail) updateStripeEmail = await stripe.customers.update(stripeId, {email: newEmail}); // https://stripe.com/docs/api/customers/update
      // if attempt fails report error on server
      if (updateStripeEmail.email !== newEmail) console.log(new Date().toISOString(), '💥 UPDATE EMAIL CONFIRMATION : Update Stripe Customer Email unsuccessful :', updateStripeEmail);
    
      // Attempt to update JWT cookie to make updated claims (email address) available to UI
      // (JWT will not be passed as cookie from this endpoint to 'refreshToken', therefore needs to be passed in http.post body)
      // -------------------------------------------------------------------------------------------
      const newTokenResponse = await http.post(`${process.env['URL']}/api/refreshToken`, { token });
      // if request fails report error on server and complete return without trying to update JWT cookie
      if (newTokenResponse.error) {
        console.log(new Date().toISOString(), '💥 UPDATE EMAIL CONFIRMATION : Refresh Token & JWT Cookie unsuccessful :', newTokenResponse);
        return serverResponse(200, true, {
          jwtUpdated: false,
        });
      }
      // else, return response that also set identity JWT cookie
      const newToken = newTokenResponse.token;
      const body = { jwtUpdated: true, newEmail };
      return cookie.setIdentityCookies(body, newToken);

    }
  
  } catch (error) {
    let { statusMessage, errorMessage } = error;
    if (!errorMessage) console.log(new Date().toISOString(), "💥 'updateEmailConfirm' endpoint unsuccessful : error.message :", error.message);

    if (errorMessage?.toLowerCase().includes('bad request')) {
      errorMessage = 'Unable to confirm email update token.'
    }

    return serverResponse(200, false, {
      statusMessage: statusMessage || 'error',
      error: errorMessage || 'Unsuccessful Request',
    });
  }

}
