// =============================================================================
// Custom serverless function for Stripe Subsdcription Updates webhook
// =============================================================================

// This is an 'additional_function' instead of a SvelteKit endpoint to
// to enable access to context.clientContext data, in order to access the
// Netlify Identity admin token needed to update 'app_metadata' (e.g. roles).

// At time of writing, context.clientContext data cannot be accessed 
// in a SvelteKit endpoint - https://github.com/sveltejs/kit/issues/1249

// NOTE - current logic expects Stripe product price has a value in its 'Price Description'
//        (shown under 'Additional Options' in Stripe admin UI and referred to as 'nickname' 
//        in API call) where first word matches desired Netlify Identity role name; e.g. –
//        - Stripe Product : Price : Price Description = 'Pro plan monthly'
//        - Netlify Identity : User role = 'pro'
// LATER: update this to a less brittle method of tying plans to roles once have clearer 
//        understanding of desired relationships between plans and role-based content

const fetch = require('node-fetch');
const stripe = require('stripe')(process.env['STRIPE_SECRET_KEY']);


// Fauna Query Helper Function
// (including this inline to avoid have to secure a separate function)
// -----------------------------------------------------------------------------
async function faunaQuery({ query, variables }) {
  const faunaUrl = 'https://graphql.fauna.com/graphql';
  const adminAuthHeader = `Bearer ${process.env['FAUNADB_SERVER_SECRET']}`;

  try {
    const response = await fetch(faunaUrl, {
      method: 'POST',
      headers: { Authorization: adminAuthHeader },
      body: JSON.stringify({
        query,
        variables,
      }),
    });
    const json = await response.json(); 
    // if response fails throw error
    if (!response.ok) {
      let errorMessage = response.statusText;
      if(json.error_description) errorMessage = json.error_description;
      if(json.msg) errorMessage = json.msg;
      console.log(Date.now(), ': DB-API faunaQuery ERROR 1', errorMessage);
      const errorResponse = { status: response.status, message: errorMessage };
      throw errorResponse;
    }
    // else return
    return {
      ok: true,
      status: response.status || 200,
      body: json || {},
    };

  } catch (error) {
    const errorMessage = error.message || error.toString() || 'Caught error.';
    return {
      ok: false,
      status: error.status || 400,
      body: { error: errorMessage },
    };
  }
};

// Handle-Subscription-Change serverless function
// -----------------------------------------------------------------------------
exports.handler = async ({ body, headers }, context) => {
  
  try {

    // Ensure event is legitimate
    const stripeEvent = await stripe.webhooks.constructEvent(
      body,
      headers['stripe-signature'],
      process.env['STRIPE_UPDATES_WEBHOOK_SECRET'],
    );

    // console.log(Date.now(), ': HANDLE SUBSCRIPTION CHANGE function stripeEvent :', stripeEvent);
    
    // Exit if this is not a subscription update event
    if (stripeEvent.type !== 'customer.subscription.updated') return;

    // Retrieve Netlify ID for Stripe Customer that was updated
    const subscription = stripeEvent.data.object;
    const faunaRequest = await faunaQuery({
      query: `
          query ($stripeID: ID!) {
            getUserByStripeID(stripeID: $stripeID) {
              netlifyID
            }
          }
        `,
      variables: {
        stripeID: subscription.customer,
      },
    });
    const netlifyID = faunaRequest.body.data.getUserByStripeID.netlifyID;

    // Take first word of the plan name to use as role name
    const plan = subscription.items.data[0].price.nickname;
    const role = plan.split(' ')[0].toLowerCase();
    
    // Send call to Netlify Identity to update user's role
    const { identity } = context.clientContext;
    await fetch(`${identity.url}/admin/users/${netlifyID}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${identity.token}`, },
      body: JSON.stringify({
        app_metadata: {
          roles: [role],
        },
      }),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };

  } catch (error) {
    return {
      statusCode: 400,
      body: `Webhook Error: ${error.message}`,
    };

  }
};
