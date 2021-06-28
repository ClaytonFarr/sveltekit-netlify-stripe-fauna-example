## Reference Repo for SvelteKit + Netlify Adapter

Example of code / use cases for potential updates to SvelteKit Netlify Adapter. 

- Details at [Github Issue](https://github.com/sveltejs/kit/issues/1249#issuecomment-866270847)
- [Demo](https://sk-netlify-example.netlify.app/)

### TL;DR

Current Netlify Adapter has 2 primary limitations:

1. Endpoints do not have access to `context.clientContext` data. This contains information needed to interact with services like Netlify Identity for admin actions. [Details](https://docs.netlify.com/functions/functions-and-identity/)
2. Netlify triggers some functionality per specifically named functions (e.g. post user signup). Endpoint 'functions' are currently aggregated into a single `render` function, preventing specifically named endpoints/functions from being available post build. [Details](https://docs.netlify.com/functions/trigger-on-events/)

### Current Workarounds

- For functionality that requires `context.clientContext` data, create a separate, custom serverless function that is copied post build into the final `functions` directory (via package.json script):
  - *Example 1*: `/src/additional_functions/delete-identity.js` (a function called explicitly by SK endpoints)
  - *Example 2*: `/src/additional_functions/handle-subscription-change.js` (a webhook triggered by an external event [Stripe subscription udpate])
- For specifically named files that are triggered by events, also create a separate custom serverless function that is copied post build into the final `functions` directory:
  - *Example*: `/src/additional_functions/identity-signup.js` (function called automatically when a new user completes signup process)

### Package versions in use at time of writing:

- **@sveltejs/kit** 1.0.0-next.115
- **@sveltejs/adapter-netlify** 1.0.0-next.17

### Requirements to implement repo:

1. Create accounts if needed; can use free plan for all.
  - [Netlify](http://www.netlify.com)
  - [Fauna.com](http://www.fauna.com)
  - [Stripe.com](http://www.stripe.com)

2. Install [Netlify CLI ](https://docs.netlify.com/cli/get-started/)

3. Clone repo & publish within own Git account

4. 

