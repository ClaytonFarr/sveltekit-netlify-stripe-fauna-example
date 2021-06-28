import loadStripe from 'stripe';
import * as db from '$lib/apis/db-api';
import verifyCurrentToken from '$lib/utils/verifyCurrentToken';
import errorResponse from '$lib/utils/errorResponse';

export async function get(request) {

  try {
    // authorize request
    const { token } = request.locals;
    const accessTokenCheck = await verifyCurrentToken(token);

    if(accessTokenCheck.ok) {

      // attempt to create user's link to Stripe Customer Portal
      const netlifyId = accessTokenCheck?.body?.id;
      const stripeId = await db.getStripeId(netlifyId);
      const stripe = await loadStripe(process.env['STRIPE_SECRET_KEY']);
      const stripeLinkRequest = await stripe.billingPortal.sessions.create({
        customer: stripeId,
        return_url: `${process.env['URL']}/account`,
      }); // https://stripe.com/docs/api/customer_portal/sessions/create

      // if stripeIdRequest fails, throw error
      if (!stripeLinkRequest.url) throw { status: stripeLinkRequest.status, message: stripeLinkRequest.body?.error.toString(), };
      // else, continue

      return {
        ok: true,
        status: stripeLinkRequest.status || 200,
        body: { link: stripeLinkRequest.url },
      }

    }

  } catch (error) {
    return errorResponse(error, 'manageBilling');
  }

}