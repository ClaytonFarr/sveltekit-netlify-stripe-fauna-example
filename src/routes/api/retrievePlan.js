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

      // attempt to load customer's current plan
      const netlifyId = accessTokenCheck?.body?.id;
      const stripeId = await db.getStripeId(netlifyId);
      const stripe = await loadStripe(process.env['STRIPE_SECRET_KEY']);

      // logic currently presumes customer will only have one plan
      // LATER: update logic and UI to collect and display multiple plans
      // https://stripe.com/docs/api/subscriptions/list
      const subscriptionsRequest = await stripe.subscriptions.list({
        customer: stripeId,
        status: 'active',
        limit: 1,
      });
      // console.log(Date.now(), ': retreivePlan subscriptionsRequest.data[0] :', subscriptionsRequest.data[0]);

      const stripePriceId = subscriptionsRequest.data[0].plan.id;
      const stripeProductId = subscriptionsRequest.data[0].plan.product;
      // https://stripe.com/docs/api/prices/retrieve
      const planDetailsRequest = await stripe.prices.retrieve(stripePriceId);
      // https://stripe.com/docs/api/products/retrieve
      const productDetailsRequest = await stripe.products.retrieve(stripeProductId);
      // console.log(Date.now(), ': retreivePlan subscriptionsRequest - planDetailsRequest :', planDetailsRequest);
      // console.log(Date.now(), ': retreivePlan subscriptionsRequest - productDetailsRequest :', productDetailsRequest);

      const productName = productDetailsRequest.name;
      const planPrice = planDetailsRequest.unit_amount; // unit amount in cents
      const planCurrency = planDetailsRequest.currency;
      const planInterval = planDetailsRequest.recurring?.interval;
      // const planIntervalCount = planDetailsRequest.recurring?.interval_count;
      
      // LATER: placeholder logic; update to something actually useful
      let currencySymbol;
      if (planCurrency === 'usd') currencySymbol = '$';

      let planIntervalLabel;
      if (planInterval === 'month') planIntervalLabel = 'mo';
      if (planInterval === 'year') planIntervalLabel = 'yr';

      const currentPlanLabel = `${productName} ･ ${currencySymbol}${Math.round(planPrice/100)}/${planIntervalLabel}`;
      // console.log(Date.now(), ': retreivePlan currentPlanLabel :', currentPlanLabel);
      
      // if stripeIdRequest fails, throw error
      if (!subscriptionsRequest.data[0].plan.id || !subscriptionsRequest.data[0].plan.product) throw { status: 400, message: 'Plan not found', };
      // else, continue

      return {
        ok: true,
        status: subscriptionsRequest.status || 200,
        body: { plan: currentPlanLabel },
      }

    }

  } catch (error) {
    return errorResponse(error, 'manageBilling');
  }

}