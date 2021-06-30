import loadStripe from 'stripe';
import * as auth from '$lib/apis/auth-api-methods';
import * as db from '$lib/apis/db-api-methods';
import { serverResponse } from '$lib/utils/helpers';

export async function get(request) {

  try {
    const { token } = request.locals;
    const accessTokenCheck = await auth.verifyCurrentToken(token);
    if(!accessTokenCheck.ok) throw { statusMessage: 'error', errorMessage: 'Unauthorized Session' };

    if(accessTokenCheck.ok) {

      const netlifyId = accessTokenCheck.id;
      const stripeId = await db.getStripeId(netlifyId);
      const stripe = await loadStripe(process.env['STRIPE_SECRET_KEY']);

      // https://stripe.com/docs/api/customer_portal/sessions/create
      const stripeLink = await stripe.billingPortal.sessions.create({
        customer: stripeId,
        return_url: `${process.env['URL']}/account`,
      });
      if (!stripeLink.url) throw { statusMessage: 'error', errorMessage: stripeLink.error.toString(), };
      
      return serverResponse(200, true, {
        link: stripeLink.url,
      })
    }

  } catch (error) {
    let { statusMessage, errorMessage } = error;
    if (!errorMessage) console.log(new Date().toISOString(), "💥 'manageBilling' endpoint unsuccessful : error.message :", error.message);

    return serverResponse(200, false, {
      statusMessage: statusMessage || 'error',
      error: errorMessage || 'Unsuccessful Request',
    });
  }

}