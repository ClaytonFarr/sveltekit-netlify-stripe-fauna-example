import loadStripe from 'stripe';
import * as auth from '$lib/apis/auth-api-methods';
import * as db from '$lib/apis/db-api-methods';
import { serverResponse } from '$lib/utils/helpers';

export async function get(request) {

  // LATER: update logic and UI to collect and display multiple plans

  try {
    const { token } = request.locals;
    const accessTokenCheck = await auth.verifyCurrentToken(token);
    if(!accessTokenCheck.ok) throw { statusMessage: 'error', errorMessage: 'Unauthorized Session' };

    if(accessTokenCheck.ok) {

      const netlifyId = accessTokenCheck.id;
      const stripeId = await db.getStripeId(netlifyId);
      const stripe = await loadStripe(process.env['STRIPE_SECRET_KEY']);

      // logic currently presumes customer will only have one plan
      // https://stripe.com/docs/api/subscriptions/list
      const subscriptions = await stripe.subscriptions.list({
        customer: stripeId,
        status: 'active',
        limit: 1,
      });
      // if subscriptions request does not contain plan/product, throw error
      if (!subscriptions.data[0].plan.id || !subscriptions.data[0].plan.product) throw { statusMessage: 'error', errorMessage: 'Subscription not found', };

      const stripePriceId = subscriptions.data[0].plan.id;
      const stripeProductId = subscriptions.data[0].plan.product;

      const planDetail = await stripe.prices.retrieve(stripePriceId); // https://stripe.com/docs/api/prices/retrieve
      if (!planDetail) throw { statusMessage: 'error', errorMessage: 'Plan not found', };

      const productDetail = await stripe.products.retrieve(stripeProductId); // https://stripe.com/docs/api/products/retrieve
      if (!productDetail) throw { statusMessage: 'error', errorMessage: 'Product not found', };

      const productName = productDetail.name;
      const planPrice = planDetail.unit_amount; // unit amount in cents
      const planCurrency = planDetail.currency;
      const planInterval = planDetail.recurring?.interval;
      
      // LATER: placeholder logic currently; update to something actually useful
      let currencySymbol;
      if (planCurrency === 'usd') currencySymbol = '$';

      let planIntervalLabel;
      if (planInterval === 'month') planIntervalLabel = 'mo';
      if (planInterval === 'year') planIntervalLabel = 'yr';

      const currentPlanLabel = `${productName} ･ ${currencySymbol}${Math.round(planPrice/100)}/${planIntervalLabel}`;
      
      return serverResponse(200, true, {
        plan: currentPlanLabel,
      })
    }

  } catch (error) {
    let { statusMessage, errorMessage } = error;
    if (!errorMessage) console.log(new Date().toISOString(), "💥 'retrievePlan' endpoint unsuccessful : error.message :", error.message);

    return serverResponse(200, false, {
      statusMessage: statusMessage || 'error',
      error: errorMessage || 'Unsuccessful Request',
    });
  }

}