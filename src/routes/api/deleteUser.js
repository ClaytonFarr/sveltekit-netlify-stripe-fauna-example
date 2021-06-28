import * as auth from '$lib/apis/auth-api';
import * as db from '$lib/apis/db-api';
import loadStripe from 'stripe';
import { parseJwt } from '$lib/utils/helpers';
import verifyCurrentToken from '$lib/utils/verifyCurrentToken';
import errorResponse from '$lib/utils/errorResponse';

export async function post(request) {

  try {
    const { token, user } = request.locals;
    const { password } = request.body;

    // authorize request
    const accessTokenCheck = await verifyCurrentToken(token); // validate user session
    const authCheck = await auth.loginUser(user.email, password); // validate user entered password
    const authCheckEmail = authCheck.body.access_token ? parseJwt(authCheck.body.access_token).email : null; // retrieve validated email
    const emailMatch = (authCheckEmail === user.email); // compare returned email to user email in session

    if(accessTokenCheck.ok && authCheck && emailMatch) {

      // attempt to delete user from Netlify Identity
      // -------------------------------------------------------------------------------------------
      const deleteIdentityUserRequest = await auth.deleteUser(token);
      // if attempt fails report error on server and throw error for client
      if (deleteIdentityUserRequest.status !== 204) {
        console.log(Date.now(), '💥 DELETE IDENTITY USER Unsuccessful - ', deleteIdentityUserRequest);
        throw { status: deleteIdentityUserRequest.status, message: 'Unable to delete account - please try again.', };
      } // else, continue
      
      // attempt to delete customer from Stripe
      // note: this must be done before User Database deletion to have Stripe ID avaialble
      // -------------------------------------------------------------------------------------------
      const netlifyId = await accessTokenCheck.body.id;
      const stripeId = await db.getStripeId(netlifyId);
      const stripe = await loadStripe(process.env['STRIPE_SECRET_KEY']);
      const deleteStripeCustomer = await stripe.customers.del(stripeId); // https://stripe.com/docs/api/customers/delete
      // if attempt fails report error on server
      if (deleteStripeCustomer && deleteStripeCustomer.deleted !== true) console.log(Date.now(), '💥 DELETE STRIPE CUSTOMER Unsuccessful - ', deleteStripeCustomer);

      // attempt to delete user from User Database
      // -------------------------------------------------------------------------------------------
      await db.deleteUser(netlifyId); // if attempt fails db.deleteUser() method will report error on server

      // attempt to clear auth cookies
      // -------------------------------------------------------------------------------------------
      const body = {};
      return auth.deleteIdentityCookies(deleteIdentityUserRequest.status, body);

    } else {
      throw { status: authCheck.status || 401, message: authCheck.body.error || 'Unauthorized request.', };
    }

  } catch (error) {
    return errorResponse(error, 'deleteUser');
  }

}