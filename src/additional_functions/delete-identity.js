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


// -----------------------------------------------------------------------------
// Delete-User serverless function
// -----------------------------------------------------------------------------

exports.handler = async (event, context) => {

  const { identity, user } = context.clientContext;

  // only continue if this request is authorized;
  // 'user' will not be present if bearer token missing or invalid

  if (user) {

    try {
      const userId = user.sub;
      const userUrl = `${identity.url}/admin/users/{${userId}}`;
      const adminAuthHeader = `Bearer ${identity.token}`;

      const identityResponse = await fetch(userUrl, {
        method: 'DELETE',
        headers: { Authorization: adminAuthHeader },
      });
      const deleteIdentityUser = await identityResponse.json();

      // successful deletion should return an empty object in deleteIdentityUser
      if (!identityResponse.ok || Object.entries(deleteIdentityUser).length > 0) {
        console.log(new Date().toISOString(), '💥 DELETE-IDENTITY function unsuccessful :', identityResponse);
        throw { statusMessage: `error (${identityResponse.status})`, errorMessage: 'Unable to delete identity.'  }
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          statusMessage: 'success',
          ...deleteIdentityUser,
        }),
      }

    } catch (error) {
      const { statusMessage, errorMessage } = error;
      console.log(new Date().toISOString(), '💥 DELETE-IDENTITY function : Caught Error :', error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          statusMessage,
          error: errorMessage,
        }),
      }
    }

  } else {
    // if authorization check fails
    return {
      statusCode: 401,
      body: JSON.stringify({
        statusMessage: 'error',
        error: 'Unauthorized Request'
      }),
    }
}
};