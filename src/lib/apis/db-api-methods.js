// ======================================================
// Fauna DB Custom API
// ======================================================


// Response utility
// ------------------------------------------------------
function response (request, testValue, methodName = '', returnTestValue = false) {
  try {
    if (request.error || !testValue) throw { status: request.status, message: request.error };
    if (testValue && returnTestValue) return testValue;
  } catch (error) {
    console.log(new Date().toISOString(), `💥 DB-API faunaQuery response '${methodName}' unsuccessful :`, request);
    return { statusMessage: `error (${error.status})`, error: error.message };
  }
}


// ------------------------------------------------------
// Fauna DB methods
// ------------------------------------------------------


// Users
// ......................................................

// Creating new users is handled by a serverless function (at
// additional_functions/identity-signup.js) after user confirms
// their signup. This function collects and passes to Fauna 
// the required Netlify ID and Stripe IDs.

export async function getFaunaId(netlifyID) {
  const request = await faunaQuery({
    query: `
      query ($netlifyID: ID!) {
        getUserByNetlifyID(netlifyID: $netlifyID) {
          _id
        }
      }
    `,
    variables: {
      netlifyID
    },
  })
  const faunaID = request?.data?.getUserByNetlifyID?._id;
  return response(request, faunaID, 'getFaunaId', true);
}

export async function getStripeId(netlifyID) {
  const request = await faunaQuery({
    query: `
      query ($netlifyID: ID!) {
        getUserByNetlifyID(netlifyID: $netlifyID) {
          stripeID
        }
      }
    `,
    variables: {
      netlifyID,
    },
  });
  const stripeID = request?.data?.getUserByNetlifyID?.stripeID;
  return response(request, stripeID, 'getStripeId', true);
}

export async function deleteUser(netlifyID) {
  const faunaID = await getFaunaId(netlifyID);
  const request = await faunaQuery({
    query: `
      mutation ($faunaID: ID!) {
        deleteUser(id: $faunaID) {
          _id
        }
      }
    `,
    variables: {
      faunaID
    },
  })
  const deletedUserId = request?.data?.deleteUser?._id;
  return response(request, deletedUserId, 'deleteUser', false);
}


// Refresh Token
// ......................................................

export async function saveRefreshToken(netlifyID, refreshToken) {
  const faunaID = await getFaunaId(netlifyID);
  const request = await faunaQuery({
    query: `
      mutation ($faunaID: ID!, $refreshToken: String) {
        updateUser(id: $faunaID, data: { refreshToken: $refreshToken }) {
          refreshToken
        }
      }
    `,
    variables: {
      faunaID,
      refreshToken
    }
  });
  const savedToken = request?.data?.updateUser?.refreshToken;
  return response(request, savedToken, 'saveRefreshToken', false);
}

export async function getRefreshToken(netlifyID) {
  const request = await faunaQuery({
    query: `
      query ($netlifyID: ID!) {
        getUserByNetlifyID(netlifyID: $netlifyID) {
          refreshToken
        }
      }
    `,
    variables: {
      netlifyID,
    },
  });
  const refreshToken = request?.data?.getUserByNetlifyID?.refreshToken;
  return response(request, refreshToken, 'getRefreshToken', true);
}

export async function deleteRefreshToken(netlifyID) {
  const faunaID = await getFaunaId(netlifyID);
  const request = await faunaQuery({
    query: `
      mutation ($faunaID: ID!, $refreshToken: String) {
        updateUser(id: $faunaID, data: { refreshToken: $refreshToken }) {
          refreshToken
        }
      }
    `,
    variables: {
      faunaID,
      refreshToken: null
    }
  });
  const noTokenPresent = request?.data?.updateUser?.refreshToken === null;
  return response(request, noTokenPresent, 'deleteRefreshToken', false);
}


// Notification Preferences
// ......................................................

export async function saveEmailNotificationPreferences(netlifyID, notifyUpdates, notifyOffers) {
  const faunaID = await getFaunaId(netlifyID);
  const request = await faunaQuery({
    query: `
      mutation ($faunaID: ID!, $notifyUpdates: Boolean, $notifyOffers: Boolean) {
        updateUser(id: $faunaID, data: { notificationEmailProductUpdates: $notifyUpdates, notificationEmailProductOffers: $notifyOffers }) {
          _id
          notificationEmailProductUpdates
          notificationEmailProductOffers
        }
      }
    `,
    variables: {
      faunaID,
      notifyUpdates,
      notifyOffers,
    },
  });
  const returnedId = request?.data?.updateUser?._id;
  return response(request, returnedId, 'saveEmailNotificationPreferences', false);
}


// ------------------------------------------------------
// Helper Functions
// ------------------------------------------------------

// Query fetch function
// ......................................................

// Helper method that returns JSON (or text fallback)
// values returned from Fauna are wrapped in 'data' object

export async function faunaQuery({ query, variables }) {
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
    const text = await response.text();
    
    if (!response.ok || (!response.status !== 204 && !text)) {
      let errorMessage = response.statusText;
      // if a custom error message is present in response, use it
      try {
        if(JSON.parse(text).error) errorMessage = JSON.parse(text).error;
        if(JSON.parse(text).error_description) errorMessage = JSON.parse(text).error_description;
        if(JSON.parse(text).msg) errorMessage = JSON.parse(text).msg;
      } catch (error) {
        if(response.statusText === 'Method Not Allowed') errorMessage = 'Unable to process request.';
      }
      const errorResponse = { status: response.status, message: errorMessage };
      throw errorResponse;
    }

    try {
      // try to parse response into JSON object
      return { statusMessage: 'success', ...JSON.parse(text) };
    } catch (err) {
      // if unsuccessful, use text fallback
      return { statusMessage: 'success', ...text };
    }

  } catch (error) {
    const errorMessage = error.message || 'Unable to process request.';
    return { statusMessage: `error (${error.status})`, error: errorMessage };
  }
};
