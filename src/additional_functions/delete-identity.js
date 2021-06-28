// =============================================================================
// Custom serverless function for Netlify Identity
// =============================================================================

// This is an 'additional_function' instead of a SvelteKit endpoint to
// to enable access to context.clientContext data, in order to access 
// the admin token needed to delete a user.

// At time of writing, context.clientContext data cannot be accessed 
// in a SvelteKit endpoint - https://github.com/sveltejs/kit/issues/1249

// We're *not* utilizing GoTrue-JS, but replicating similar functionality.
// https://github.com/netlify/gotrue-js#admin-methods
// https://github.com/netlify/gotrue-js#delete-a-user

// This function must be called with a valid bearer token authorization header.


const fetch = require('node-fetch');


// Delete-User serverless function
// -----------------------------------------------------------------------------
exports.handler = async (event, context) => {

  const { identity, user } = context.clientContext;

  // only continue if this request is authorized;
  // 'user' will not be present if bearer token missing or invalid

  if (user) {
    const userId = user.sub;
    const userUrl = `${identity.url}/admin/users/{${userId}}`;
    const adminAuthHeader = `Bearer ${identity.token}`;

    try {
      return fetch(userUrl, {
        method: 'DELETE',
        headers: { Authorization: adminAuthHeader },
      })
        .then((response) => {
          // console.log(Date.now(), ': DELETE IDENTITY function response :', response);
          return response.json();
        })
        .then((data) => {
          // console.log(Date.now(), '✅ DELETE IDENTITY function Successful :', data);
          return { statusCode: 204 };
        })
        .catch((error) => {
          // console.log(Date.now(), ': DELETE IDENTITY function error :', error);
          return { 
            statusCode: 500,
            body: `Internal Server Error: ${error}`,
           };
        });
    } catch (error) {
      console.log(Date.now(), '💥 DELETE IDENTITY function Unsuccessful :', error);
      return error;
    }

  } else {
    return { statusCode: 401 };
  }
};