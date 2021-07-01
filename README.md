## Reference Repo for SvelteKit + Netlify Adapter

Example of code / use cases for potential updates to SvelteKit Netlify Adapter.

- Details at related [Github Issue](https://github.com/sveltejs/kit/issues/1249#issuecomment-846638681)
- [Demo](https://sveltekit-gotrue-stripe-fauna.netlify.app/)

### Issues Summary

Current Netlify Adapter has 2 primary limitations:

1. Endpoints do not have access to `context.clientContext` data. This contains information needed to interact with services like Netlify Identity for admin actions. [Details](https://docs.netlify.com/functions/functions-and-identity/)
2. Netlify triggers some functionality per specifically named functions (e.g. post user sign-up). Endpoint 'functions' are currently aggregated into a single `render` function, preventing specifically named endpoints/functions from being available post build. [Details](https://docs.netlify.com/functions/trigger-on-events/)

### Current Workarounds

- For functionality that requires `context.clientContext` data, create a separate, custom serverless function that is copied post build into the final `functions` directory (via package.json script):
  - _Example 1_: `/src/additional_functions/delete-identity.js` (a function called explicitly by SK endpoints)
  - _Example 2_: `/src/additional_functions/handle-subscription-change.js` (a webhook triggered by an external event [Stripe subscription update])
- For specifically named files that are triggered by events, also create a separate custom serverless function that is copied post build into the final `functions` directory:
  - _Example_: `/src/additional_functions/identity-signup.js` (function called automatically when a new user completes sign-up process)

### Package versions in use at time of writing:

- **@sveltejs/kit** 1.0.0-next.115
- **@sveltejs/adapter-netlify** 1.0.0-next.17

====================================================================

### Steps to Implement Repo

_This repo is an in-progress example of a larger project that has several moving parts and integrations (Netlify Identity for authentication, Fauna DB for user data, Stripe for subscription plans and management, Tailwind CSS/UI)._

To implement a fully working copy of it, follow the steps below –

1. Create accounts if needed for -

   - [Netlify.com](http://www.netlify.com)
   - [Fauna.com](http://www.fauna.com)
   - [Stripe.com](http://www.stripe.com)
   - _Note_: can use free plans

2. Install & authenticate [Netlify CLI ](https://docs.netlify.com/cli/get-started/)

3. Clone repo locally & publish copy to own GitHub account

4. Within terminal & directory of local copy of repo:

   - `$ ntl init`
     - select 'Create & configure new site' & desired Netlify team
     - choose site name
     - confirm build defaults ('npm run build', 'build' & 'functions' directories)
     - _Note_: Netlify will deploy a version of site at site name URL, but this is not fully functional yet

5. Enable Netlify Identity

   - `$ ntl open:admin`
   - click on 'Identity' link in header and select 'Enable Identity'

6. Install and authenticate [Netlify Fauna DB addon](https://docs.netlify.com/cli/get-started/)

   - `$ ntl addons:create fauna`
   - `$ ntl addons:auth fauna`
     - this will open Fauna and ask you to import DB created via Netlify add-on
     - you can name DB anything you'd like (e.g. same name as site name)
     - _Note_: this Netlify Fauna add-on will also create the API keys needed as env vars that are not exposed in Netlify's UI but are visible when you run `$ ntl env:list`

7. Configure Fauna database

   - post import, select 'Create New Collection', name 'User' and save
   - select 'GraphQL' link in sidebar and select 'Import Schema'
   - import `/src/lib/apis/db-api-schema.gql`
   - under 'Collections' link in sidebar should see new, empty 'User' collection

8. Configure Stripe products

   - ensure account is in test mode with toggle setting in sidebar
   - add sample recurring products & prices (i.e. plans) ([example tutorial](https://www.netlify.com/blog/2020/07/13/manage-subscriptions-and-protect-content-with-stripe/#set-up-stripe-and-add-subscription-tiers))
   - _Note_: in the current code, the first word the 'Price description' value for each price for each product will be used as the user's role in Netlify Identity. This is available under the 'Additional options' shown for each price.

9. Configure Stripe Customer Portal

   - go to https://dashboard.stripe.com/test/settings/billing/portal
   - within 'Functionality' section:
     - turn on Payment methods: 'Allow customers to update their payment methods'
     - turn on Update subscriptions: 'Allow customers to switch to different pricing plan'
   - within 'Products' section:
     - add all test products created under 'Added Products'
   - within 'Business Information' section:
     - enter a value for 'Terms of Service' (e.g. https://www.domain.tld/tos)
     - enter a value for 'Privacy' (e.g. https://www.domain.tld/privacy)
   - click 'Save'

10. Create Stripe subscription update webhook

    - select 'Developers' : 'Webhooks' link in sidebar and 'Add Endpoint' button
    - for 'Endpoint URL' enter: https://<YOUR_SITE_NAME>.netlify.app/.netlify/functions/handle-subscription-change
    - in 'Events to send', search for and select `customer.subscription.updated`
    - save endpoint

11. Add Stripe keys as environment variables

    - select default product/price to apply to new customers (e.g. Free Plan) and copy 'API ID' value
      - save value as Netlify env var: `$ ntl env:set STRIPE_DEFAULT_PRICE_PLAN your-product-API-ID`
    - select 'Developers' : 'API keys' link in sidebar and copy 'Secret key' value
      - save value as Netlify env var: `$ ntl env:set STRIPE_SECRET_KEY your-stripe-secret-key`
    - select 'Developers' : 'Webhooks' link in sidebar, select earlier created webhook and copy 'Signing Secret' value
      - save value as Netlify env var: `$ ntl env:set STRIPE_UPDATES_WEBHOOK_SECRET your-webhook-signing-secret`
    - if you run `$ ntl env:list` you should now see 6 variables for:
      - STRIPE_DEFAULT_PRICE_PLAN
      - STRIPE_SECRET_KEY
      - STRIPE_UPDATES_WEBHOOK_SECRET
      - FAUNADB_ADMIN_SECRET
      - FAUNADB_SERVER_SECRET
      - FAUNADB_CLIENT_SECRET

12. Rebuild / deploy site

    - _Note_: site needs to be rebuilt with new env variables in place to be functional
    - within Netlify admin, select 'Deploys' link in header
    - within 'Trigger Deploy' menu select 'Clear cache and deploy site'

13. Create and test new user

    - on site's welcome page, sign-up a new user (via 'start your 14-day free trial' link)
    - at this point you will see
      - a new user in Netlify : Identity admin without any role assigned (this user is created but not confirmed)
    - when you sign-up you should receive a sign-up confirmation email
    - email link should open site and confirm your account
    - at this point you should see
      - a role (e.g. 'free') assigned to user in Netlify : Identity admin
      - an entry in Fauna DB that contains this user's Netlify ID, Stripe ID, and current refresh token
      - a new customer created in Stripe with user's email address with the default plan assigned (e.g. Free)
    - from /account can also
      - update email address (with associated confirmation email)
      - update password
      - manage subscription plan via Stripe customer portal
      - delete account
    - signing in/out
      - sets and removes a JWT httpOnly cookie for authentication
      - sets and removes a refresh token for user in Fauna database
    - updating subscription plan via /account 'manage' link
      - updates user's subscription in Stripe customer account
      - triggers webhook function to update user's Netlify Identity role to first word or product/plan name
      - to test can use card info '4242 4242 4242 4242' 12/30 424 90210

14. To run site locally
    - install dependencies: `$ npm i`
    - run SvelteKit with Netlify dev: `$ ntl dev`
    - _notes_:
      - most actions are available locally but some will create temporary false errors. For example, when logging in a user that exists in Netlify Identity you may see an 'Unable to Process' message and a 405 network response. This may be an issue with Netlify Identity & Netlify Dev. Repeat the action 1-2 times and it will proceed normally.
      - to login in as user locally, user must exist in Netlify Identity (i.e. have signed up via locally run site or production site)
      - confirmation emails will link to the production site
