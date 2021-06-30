import * as auth from '$lib/apis/auth-api-methods';
import * as db from '$lib/apis/db-api-methods';
import * as cookie from '$lib/utils/cookies';
import loadStripe from 'stripe';
import { serverResponse } from '$lib/utils/helpers';

export async function post(request) {

  try {
    const { token, user } = request.locals;
    const { password } = request.body;

    // authorize request
    const accessTokenCheck = await auth.verifyCurrentToken(token); // validate user session
    if(!accessTokenCheck.ok) throw { statusMessage: 'error', errorMessage: 'Unauthorized Session' };

    const authCheck = await auth.loginUser(user.email, password); // validate user entered password
    if(authCheck.error) throw { statusMessage: authCheck.statusMessage, errorMessage: 'Please double-check current password.' };

    const emailMatch = (accessTokenCheck.email === user.email); // compare returned email to user email in session
    if(!emailMatch) throw { statusMessage: 'error', errorMessage: 'Unauthorized User' };

    if(accessTokenCheck.ok && authCheck && emailMatch) {

      // Attempt to delete user from Netlify Identity
      // -------------------------------------------------------------------------------------------
      const deleteIdentityUser = await auth.deleteUser(token);
      // if attempt fails report error on server and throw error for client
      if (deleteIdentityUser.body?.error) {
        console.log(new Date().toISOString(), '💥 DELETE IDENTITY USER unsuccessful :', deleteIdentityUser);
        throw { statusMessage: `error (${deleteIdentityUser.status})`, errorMessage: 'Unable to delete account - please try again.', };
      }
      
      // Attempt to delete customer from Stripe
      // note: this must be done *before* user database deletion to have Stripe ID available
      // -------------------------------------------------------------------------------------------
      const netlifyId = await accessTokenCheck.id;
      const stripeId = await db.getStripeId(netlifyId);
      const stripe = await loadStripe(process.env['STRIPE_SECRET_KEY']);
      const deleteStripeCustomer = await stripe.customers.del(stripeId); // https://stripe.com/docs/api/customers/delete
      // if attempt fails report error on server
      if (deleteStripeCustomer && deleteStripeCustomer.deleted !== true) {
        console.log(new Date().toISOString(), '💥 DELETE STRIPE CUSTOMER unsuccessful :', deleteStripeCustomer)
      };

      // Attempt to delete user from User Database
      // -------------------------------------------------------------------------------------------
      await db.deleteUser(netlifyId);
      // if attempt fails db.deleteUser() method will report error on server

      // Attempt to clear auth cookies
      // -------------------------------------------------------------------------------------------
      const body = {};
      return cookie.deleteIdentityCookies(body);

    }

  } catch (error) {
    let { statusMessage, errorMessage } = error;
    if (!errorMessage) console.log(new Date().toISOString(), "💥 'deleteUser' endpoint unsuccessful : error.message :", error.message);

    if (errorMessage?.toLowerCase().includes('bad request')) {
      errorMessage = 'We encountered a system error - please try again.'
    }
    if (errorMessage?.toLowerCase().includes('user not found') || errorMessage?.toLowerCase().includes('no user found')) {
      errorMessage = 'Unauthorized, please double-check password.'
    }
    return serverResponse(200, false, {
      statusMessage: statusMessage || 'error',
      error: errorMessage || 'Unsuccessful Request',
    });
  }

}