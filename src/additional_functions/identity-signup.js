// =============================================================================
// Custom serverless function for Netlify Identity
// =============================================================================

// This is an 'additional_function' instead of a SvelteKit endpoint to
// to enable Netlify Identity to trigger the function on a 'signup' event.

// This function will run after a new user confirms their signup by clicking
// the confirmation link emailed to them.

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


// Identity-Signup serverless function
// -----------------------------------------------------------------------------
exports.handler = async (event) => {

  // when this function is triggered. 'user' data is automatically passed by Netlify Identity
  const { user } = JSON.parse(event.body);

  // only continue if this request is authorized;
  // 'user' not present if Netlify didn't trigger function from a user event
  if (user) {

    // Create new customer in Stripe
    // --------------------------------------------------------------------------------
    const customer = await stripe.customers.create({ email: user.email }); // https://stripe.com/docs/api/customers/create

    // subscribe the new customer to default, 'Free' plan
    await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: process.env['STRIPE_DEFAULT_PRICE_PLAN'] }],
    });

    // Store Netlify and Stripe IDs in Fauna user database
    // --------------------------------------------------------------------------------
    await faunaQuery({
      query: `
        mutation ($netlifyID: ID!, $stripeID: ID!) {
          createUser(data: { netlifyID: $netlifyID, stripeID: $stripeID }) {
            netlifyID
            stripeID
          }
        }
      `,
      variables: {
        netlifyID: user.id,
        stripeID: customer.id,
      },
    });

    // Update user's role within Identity to match default plan assigned
    // --------------------------------------------------------------------------------
    return {
      statusCode: 200,
      body: JSON.stringify({
        app_metadata: {
          roles: ['free'],
        },
      }),
    };

  }
};
