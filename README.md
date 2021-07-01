A SaaS starter boilerplate with elegant UX to use as reference or point to build upon. 

The focus was creating a serverless app that utilizes modern tooling and is centralized to as few platforms as possible.

There are [a few remaining baseline items](https://github.com/ClaytonFarr/sveltekit-netlify-stripe-fauna-example#outstanding-to-dos) you should considering adding, but hopefully this provides a solid head start if you're choosing to work with these tools or platforms.

### Utilizes

- [SvelteKit](https://kit.svelte.dev/)
- [Netlify Identity](https://docs.netlify.com/visitor-access/identity/) authentication / [GoTrue](https://github.com/netlify/gotrue)
- [Stripe](https://stripe.com/) subscriptions & [customer portal](https://stripe.com/docs/billing/subscriptions/customer-portal)
- [Fauna](https://fauna.com/) GraphQL database
- [Tailwind](https://tailwindcss.com/)
- [SveltePreprocess](https://github.com/sveltejs/svelte-preprocess) for [Pug](https://pugjs.org/api/getting-started.html) markup
- Deployment as serverless app on [Netlify](https://www.netlify.com/) via SvelteKit's [Netlify Adapter](https://github.com/sveltejs/kit/tree/master/packages/adapter-netlify)

### Functionality

- Authentication - via JWT cookie & Netlify Identity / GoTrue
- Authentication [email templates](https://github.com/ClaytonFarr/sveltekit-netlify-stripe-fauna-example/tree/master/src/auth_email_templates)
- Authentication & account management UX
- [Helper methods](https://github.com/ClaytonFarr/sveltekit-netlify-stripe-fauna-example/blob/master/src/lib/apis/auth-api-methods.js) to access GoTrue API without JS client
- Subscription billing and management - via Stripe
- User database - via Fauna
- [Helper methods](https://github.com/ClaytonFarr/sveltekit-netlify-stripe-fauna-example/blob/master/src/lib/apis/db-api-methods.js) to access Fauna GraphQL API without JS client
- Responsive layouts
- Configurable color system - through Tailwind
- Configurable [form components](https://sveltekit-gotrue-stripe-fauna-example.netlify.app/demos/form-inputs) that utilize flexible, browser-based validation
- Configurable [modal component](https://sveltekit-gotrue-stripe-fauna-example.netlify.app/demos/modal)
- Configurable [notifications component](https://sveltekit-gotrue-stripe-fauna-example.netlify.app/demos/notifications)
- Combining of SvelteKit serverless functions (aka endpoints) with [custom Netlify functions](https://github.com/ClaytonFarr/sveltekit-netlify-stripe-fauna-example/tree/master/src/additional_functions)

### Demo

- [Demo Site](https://sveltekit-gotrue-stripe-fauna-example.netlify.app)
- _Kick the tires…_
  - sign up and confirm as a new user
  - login / logout
  - retrieve lost password
  - update email address
  - update password
  - manage subscription & billing method
  - delete account

### Outstanding To Dos

There are a few areas I didn't had time to tie up in this repo, but would recommend looking into –

- add measures to sanitize user-entered data at endpoints ([example](https://linguinecode.com/post/validate-sanitize-user-input-javascript))
- add measures to secure JWT cookie against [CSRF](https://en.wikipedia.org/wiki/Cross-site_request_forgery) attacks ([details](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html); look for modern simpler fixes with JWT cookies & serverless architectures)
- ensure [HTTP security headers](https://owasp.org/www-project-secure-headers/) are set properly to prevent [common security issues](https://securityheaders.com/)
- add Terms of Service content & agreement (checkbox) at sign-up and save election to Fauna database when creating user
- to improve UX, add messaging when a user's session expires (see `sessionExpired` flags in code for start of this)
- to improve UX, add functionality to refresh user's JWT cookie before expiration during an active session (see `touchTime` in code for start of this)
- add views and UX to handle attempted logins from accounts with cancelled or paused subscriptions
- implement UX/UI testing library at this point, before app grows (e.g. [Cypress](https://docs.cypress.io/guides/overview/why-cypress))
- test app's current accessibility, GDPR compliance, and performance
- configure [Netlify Build Plugins](https://www.netlify.com/products/build/plugins/) to help automate and regulate any requirements you care about
- test [Netlify Analytics](https://www.netlify.com/products/analytics/) with application to see if it's worth utilizing

### Random Details

#### Accommodating custom Netlify functions

The current Netlify Adapter has 2 primary limitations:

1. Endpoints do not have access to `context.clientContext` data. This contains information needed to interact with services like Netlify Identity for admin actions. [Details](https://docs.netlify.com/functions/functions-and-identity/)
2. Netlify triggers some functionality per specifically named functions (e.g. post user sign-up). Endpoint 'functions' are currently aggregated into a single `render` function, preventing specifically named endpoints/functions from being available post build. [Details](https://docs.netlify.com/functions/trigger-on-events/)

_Current Workaround_

- For functionality that requires `context.clientContext` data, create a separate, custom serverless function that is copied post build into the final `functions` directory (via package.json script):
  - _Example 1_: `/src/additional_functions/delete-identity.js` (a function called explicitly by SK endpoints)
  - _Example 2_: `/src/additional_functions/handle-subscription-change.js` (a webhook triggered by an external event [Stripe subscription update])
- For specifically named files that are triggered by events, also create a separate custom serverless function that is copied post build into the final `functions` directory:
  - _Example_: `/src/additional_functions/identity-signup.js` (function called automatically when a new user completes sign-up process)

#### Safe JWT cookie authentication

To add...

#### Utilizing Netlify Identity (GoTrue) sans client Javascript

To add...

#### Browser-based 'constraint' form validation

To add...

#### Injecting custom color sets into Tailwind

To add...


---

### How-To Implement

At time of publishing, current versions in use are -

- **@sveltejs/kit** 1.0.0-next.115
- **@sveltejs/adapter-netlify** 1.0.0-next.17

If things don't work or project cannot build successfully, either
- A) double-check there have not been any breaking changes in SvelteKit [changelog](https://github.com/sveltejs/kit/blob/master/packages/kit/CHANGELOG.md) or Netlify Adapter [changelog](https://github.com/sveltejs/kit/blob/master/packages/adapter-netlify/CHANGELOG.md), or 
- B) update package.json to use the versions above, and work forward from there.

To implement a fully working copy of this repo, follow the steps below –

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
