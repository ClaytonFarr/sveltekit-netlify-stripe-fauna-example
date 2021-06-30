// =============================================================================
// Custom serverless function for Netlify Identity
// =============================================================================

// This is an 'additional_function' instead of a SvelteKit endpoint to
// to enable Netlify Identity to trigger the function on a 'signup' event.

// This function will run after a new user confirms their signup by clicking
// the confirmation link emailed to them.

const fetch = require('node-fetch');
const stripe = require('stripe')(process.env['STRIPE_SECRET_KEY']);


// -----------------------------------------------------------------------------
// Identity-Signup serverless function
// -----------------------------------------------------------------------------

exports.handler = async (event) => {

  // when this function is triggered. 'user' data is automatically passed by Netlify Identity
  const { user } = JSON.parse(event.body);

  // only continue if this request is authorized;
  // 'user' not present if Netlify didn't trigger function from a user event
  if (user) {

    try {

      // create new customer in Stripe
      // https://stripe.com/docs/api/customers/create
      const customer = await stripe.customers.create({ email: user.email });
      if(!customer.id) {
        console.log(new Date().toISOString(), '💥 IDENTITY-SIGNUP function : Create Stripe Customer unsuccessful :', customer);
        throw { statusMessage: 'error', errorMessage: customer.message || 'Unable to create Stripe customer.'  }
      }
      
      // subscribe the new customer to default, 'Free' plan
      // https://stripe.com/docs/api/subscriptions/create
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: process.env['STRIPE_DEFAULT_PRICE_PLAN'] }],
      });
      if(!subscription.id) {
        console.log(new Date().toISOString(), '💥 IDENTITY-SIGNUP function : Create Stripe Subscription unsuccessful :', subscription);
        throw { statusMessage: 'error', errorMessage: subscription.message || 'Unable to create Stripe subscription.'  }
      }

      // store Netlify and Stripe IDs in Fauna user database
      const databaseResponse = await fetch('https://graphql.fauna.com/graphql', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env['FAUNADB_SERVER_SECRET']}` },
        body: JSON.stringify({
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
        }),
      });
      const databaseUpdate = await databaseResponse.json();
      if(!databaseResponse.ok || databaseUpdate.data === null) {
        console.log(new Date().toISOString(), '💥 IDENTITY-SIGNUP function : Update Fauna DB unsuccessful :', databaseResponse);
        throw { statusMessage: `error (${databaseResponse.status})`, errorMessage: databaseUpdate.errors[0].message || 'Unable to complete database update.'  }
      }

      // update user's role within Identity to match default plan assigned
      return {
        statusCode: 200,
        body: JSON.stringify({
          statusMessage: 'success', 
          app_metadata: {
            roles: ['free'],
          },
        }),
      };

    } catch (error) {
      const { statusMessage, errorMessage } = error;
      console.log(new Date().toISOString(), '💥 IDENTITY-SIGNUP function : Caught Error :', error);
      return {
        statusCode: 400,
        body: JSON.stringify({
          statusMessage, 
          error: errorMessage,
        }),
      };
    }
  }
};
