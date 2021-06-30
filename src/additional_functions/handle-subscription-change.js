// =============================================================================
// Custom serverless function for Stripe Subscription Updates webhook
// =============================================================================

// This is an 'additional_function' instead of a SvelteKit endpoint to
// to enable access to context.clientContext data, in order to access the
// Netlify Identity admin token needed to update 'app_metadata' (e.g. roles).

// At time of writing, context.clientContext data cannot be accessed 
// in a SvelteKit endpoint - https://github.com/sveltejs/kit/issues/1249

// NOTE - current logic expects Stripe product price has a value in its 'Price Description'
//        (shown under 'Additional Options' in Stripe admin UI and referred to as 'nickname' 
//        in API call) where it's first word matches desired Netlify Identity role name; e.g. –
//        - Stripe Product : Price : Price Description = 'Pro plan monthly'
//        - Netlify Identity : User role = 'pro'

// LATER: update this ↑ to a less brittle method of tying plans to roles once have clearer 
//        understanding of desired relationships between plans and role-based content

const fetch = require('node-fetch');
const stripe = require('stripe')(process.env['STRIPE_SECRET_KEY']);


// -----------------------------------------------------------------------------
// Handle-Subscription-Change serverless function
// -----------------------------------------------------------------------------

exports.handler = async ({ body, headers }, context) => {
  
  try {
    const stripeEvent = await stripe.webhooks.constructEvent(
      body,
      headers['stripe-signature'],
      process.env['STRIPE_UPDATES_WEBHOOK_SECRET'],
    );

    // check Stripe event for subscription
    const subscription = stripeEvent.data.object;
    if(!subscription) {
      console.log(new Date().toISOString(), '💥 HANDLE-SUBSCRIPTION-CHANGE function : stripeEvent subscription empty :', stripeEvent);
      throw { statusMessage: 'error', errorMessage: stripeEvent.message || 'No Stripe subscription available.' }
    }
    if (stripeEvent.type !== 'customer.subscription.updated') {
      console.log(new Date().toISOString(), '💥 HANDLE-SUBSCRIPTION-CHANGE function : stripeEvent not a subscription update :', stripeEvent);
      throw { statusMessage: 'error', errorMessage:'Incorrect Stripe event type.' }

    }

    // retrieve Netlify ID for Stripe Customer that was updated
    const databaseResponse = await fetch('https://graphql.fauna.com/graphql', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env['FAUNADB_SERVER_SECRET']}` },
      body: JSON.stringify({
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
      }),
    });
    const databaseUpdate = await databaseResponse.json();
    const netlifyID = databaseUpdate.data.getUserByStripeID.netlifyID;
    if(!databaseResponse.ok || !netlifyID) {
      console.log(new Date().toISOString(), '💥 HANDLE-SUBSCRIPTION-CHANGE function : Netlify ID retrieval unsuccessful :', databaseResponse);
      throw { statusMessage: `error (${databaseResponse.status})`, errorMessage: databaseUpdate.errors[0].message || 'Unable to retrieve Netlify Identity ID.'  }
    }

    // take first word of the plan name to use as role name
    const plan = subscription.items.data[0].price.nickname;
    if (!plan) {
      console.log(new Date().toISOString(), '💥 HANDLE-SUBSCRIPTION-CHANGE function : plan name not found :', databaseResponse);
      throw { statusMessage: 'error', errorMessage: 'Unable to retrieve plan name.'  }
    }
    const role = plan.split(' ')[0].toLowerCase();
    
    // send call to Netlify Identity to update user's role
    const { identity } = context.clientContext;
    const identityResponse = await fetch(`${identity.url}/admin/users/${netlifyID}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${identity.token}`, },
      body: JSON.stringify({
        app_metadata: {
          roles: [role],
        },
      }),
    });
    const identityUpdate = await identityResponse.json();
    const identityRolesUpdated = identityUpdate.app_metadata.roles[0] === role;
    if(!identityResponse.ok || !identityRolesUpdated) {
      console.log(new Date().toISOString(), '💥 HANDLE-SUBSCRIPTION-CHANGE function : update Identity role unsuccessful :', identityResponse);
      throw { statusMessage: `error (${identityResponse.status})`, errorMessage: 'Unable to update Identity role.'  }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        statusMessage: 'success',
        received: true,
      }),
    };
    
  } catch (error) {
    console.log(new Date().toISOString(), '💥 HANDLE-SUBSCRIPTION-CHANGE function : Caught Error :', error);
    return {
      statusCode: 400,
      body: JSON.stringify({
        statusMessage: 'error',
        error: `Webhook Error: ${error.message}`,
      }),
    };
  }
};
