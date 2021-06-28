import * as auth from '$lib/apis/auth-api';
import * as db from '$lib/apis/db-api';
import loadStripe from 'stripe';
import verifyCurrentToken from '$lib/utils/verifyCurrentToken';
import errorResponse from '$lib/utils/errorResponse';

export async function post(request) {

  try {
    // authorize request
    const { token } = request.locals;
    const accessTokenCheck = await verifyCurrentToken(token);

    // console.log(Date.now(), ': UPDATE EMAIL CONFIRMATION endpoint accessTokenCheck :', accessTokenCheck);

    if(accessTokenCheck.ok) {

      // attempt to confirm email change token
      // -------------------------------------------------------------------------------------------
      const { updateToken } = request.body; // #email_change_token value passed to endpoint
      const confirmEmailChangeToken = await auth.confirmEmailChange(token, updateToken);

      // if confirmEmailChangeToken fails, throw error
      if (!confirmEmailChangeToken.ok || confirmEmailChangeToken.body.error) throw { status: confirmEmailChangeToken.status, message: confirmEmailChangeToken.body.error, };

      // When an email change has been successfully *requested* previously a 'email_change_sent_at' key is present.
      // When an email change has been successfully *confirmed* the 'new_email' key is deleted.
      // Example successful return -
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

      // Currently testing for success implicitly via confirmEmailChangeToken.ok,
      // existence of 'email_change_sent_at' and absence of 'new_email'.

      // Test email updated successfully
      const emailChangeRequested = confirmEmailChangeToken.body.email_change_sent_at;
      const emailChangeConfirmed = !confirmEmailChangeToken.body.new_email;
      const identityEmailUpdated = (emailChangeRequested && emailChangeConfirmed);

      // throw error if success test fails
      if (!identityEmailUpdated) throw { status: 500, message: 'Unable to update email address.', };
      // else, continue

      // attempt to update email in Stripe
      // -------------------------------------------------------------------------------------------
      const netlifyId = accessTokenCheck?.body?.id;
      const stripeId = await db.getStripeId(netlifyId);
      const newEmail = confirmEmailChangeToken?.body?.email;
      const stripe = await loadStripe(process.env['STRIPE_SECRET_KEY']);
      let updateStripeCustomerEmail;
      if(netlifyId && newEmail) updateStripeCustomerEmail = await stripe.customers.update(stripeId, {email: newEmail}); // https://stripe.com/docs/api/customers/update
      // if attempt fails report error on server
      if (updateStripeCustomerEmail.email !== newEmail) console.log(Date.now(), '💥 UPDATE EMAIL CONFIRMATION : Update Stripe Customer Email Unsuccessful - ', updateStripeCustomerEmail);
    
      // attempt to update JWT cookie to make updated claims (email address) available to UI
      // (note: using inline fetch here since http helper methods used elsewhere are not configured to work with endpoint to endpoint requests yet)
      // -------------------------------------------------------------------------------------------
      const newTokenRequest = await fetch(`${process.env['URL']}/api/refreshToken`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ token })
      } );
      const newTokenRequestData = await newTokenRequest.json();
      // if request fails report error on server and complete return without trying to update JWT cookie
      if (!newTokenRequest.ok || newTokenRequestData.body?.error) {
        console.log(Date.now(), '💥 UPDATE EMAIL CONFIRMATION : Refresh Token & JWT Cookie Unsuccessful - ', newTokenRequest);
        return {
          ok: true,
          status: 200,
          body: { jwtUpdated: false },
        };
      }
      // else, complete return with new JWT cookie
      const newToken = newTokenRequestData.token;
      const body = { jwtUpdated: true, newEmail };
      return auth.setIdentityCookies(newTokenRequest.status, body, newToken);
    } else {
      throw { status: 401, message: 'Unauthorized Request', };
    }
  
  } catch (error) {
    return errorResponse(error, 'updateEmailConfirm');
  }

}
