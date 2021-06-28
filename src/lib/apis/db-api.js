// ======================================================
// Fauna DB Custom API
// ======================================================


// ------------------------------------------------------
// Fuana DB methods
// ------------------------------------------------------


// Users
// ......................................................

// Creating new users is handled by a serverless function (at
// additonal_functions/identity-signup.js) after user confirms
// their signup. This function collects and passes to Fuana 
// the required Netlify ID and Stripe IDs.

export async function getStripeId(netlifyID) {
  const requestStripeID = await faunaQuery({
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
  const stripeID = requestStripeID?.body?.data?.getUserByNetlifyID?.stripeID;
  return stripeID;
}

export async function deleteUser(netlifyID) {
  const requestFaunaID = await faunaQuery({
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
  const faunaID = requestFaunaID?.body?.data?.getUserByNetlifyID?._id;
  const deleteFaunaUser = await faunaQuery({
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
  const returnedId = deleteFaunaUser?.body?.data?.deleteUser?._id;
  response({test: returnedId, methodName: 'deleteUser', request: deleteFaunaUser });
}


// Refresh Token
// ......................................................

export async function saveRefreshToken(netlifyID, refreshToken) {
  const requestIDs = await faunaQuery({
    query: `
      query ($netlifyID: ID!) {
        getUserByNetlifyID(netlifyID: $netlifyID) {
          _id
        }
      }
    `,
    variables: {
      netlifyID,
    }
  })
  const faunaID = requestIDs?.body?.data?.getUserByNetlifyID?._id;
  const saveRefreshToken = await faunaQuery({
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
  const returnedToken = saveRefreshToken?.body?.data?.updateUser?.refreshToken;
  response({test: returnedToken, methodName: 'saveRefreshToken', request: saveRefreshToken});
}

export async function getRefreshToken(netlifyID) {
  const requestToken = await faunaQuery({
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
  const refreshToken = requestToken?.body?.data?.getUserByNetlifyID?.refreshToken;
  return refreshToken;
}

export async function deleteRefreshToken(netlifyID) {
  const requestIDs = await faunaQuery({
    query: `
      query ($netlifyID: ID!) {
        getUserByNetlifyID(netlifyID: $netlifyID) {
          _id
        }
      }
    `,
    variables: {
      netlifyID,
    }
  })
  const faunaID = requestIDs?.body?.data?.getUserByNetlifyID?._id;
  const clearRefreshToken = await faunaQuery({
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
  const noTokenPresent = clearRefreshToken?.body?.data?.updateUser?.refreshToken === null;
  response({test: noTokenPresent, methodName: 'deleteRefreshToken', request: clearRefreshToken});
}


// Notification Preferences
// ......................................................

export async function saveEmailNotificationPreferences(netlifyID, notifyUpdates, notifyOffers) {
  const requestIDs = await faunaQuery({
    query: `
      query ($netlifyID: ID!) {
        getUserByNetlifyID(netlifyID: $netlifyID) {
          _id
        }
      }
    `,
    variables: {
      netlifyID,
    },
  })
  const faunaID = requestIDs?.body?.data?.getUserByNetlifyID?._id;
  const saveNotifications = await faunaQuery({
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
  const returnedId = saveNotifications?.body?.data?.updateUser?._id;
  response({test: returnedId, methodName: 'saveEmailNotificationPreferences', request: saveNotifications});
}


// ------------------------------------------------------
// Helper Functions
// ------------------------------------------------------

// Query Fetch Function
// ......................................................
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
    const json = await response?.json(); 
    
    // console.log('----------------------------------------------------------------------------------');
    // console.log(Date.now(), `*** DB-API faunaQuery START ***`);
    // console.log(Date.now(), `: DB-API faunaQuery response`, response);
    // console.log(Date.now(), `: DB-API faunaQuery response.ok`, response.ok);
    // console.log(Date.now(), `: DB-API faunaQuery response.status`, response.status);
    // console.log(Date.now(), `: DB-API faunaQuery response.statusText`, response.statusText);
    // console.log(Date.now(), `: DB-API faunaQuery json`, json);

    // if response fails throw error
    if (!response?.ok) {
      let errorMessage = response.statusText;
      if(json?.error_description) errorMessage = json.error_description;
      if(json?.msg) errorMessage = json.msg;
      // console.log(Date.now(), ': DB-API faunaQuery ERROR 1', errorMessage);
      const errorResponse = { status: response.status, message: errorMessage };
      throw errorResponse;
    }

    // else return
    // console.log(Date.now(), ': DB-API faunaQuery SUCCESS (json)', JSON.stringify(json));
    return {
      ok: true,
      status: response.status || 200,
      body: json,
    };

  } catch (error) {
    // console.log(Date.now(), ': DB-API faunaQuery ERROR 2', JSON.stringify(error));
    const errorMessage = error.message || error.toString() || 'Caught error.';
    return {
      ok: false,
      status: error.status || 400,
      body: { error: errorMessage },
    };
  }
};

// Response with Logging
// ......................................................
// TODO: implement simpler/more consistent way to handle responses across all methods
//       this doesn't hold up well for methods that are returning data like 'getRefreshToken'
function response ({test = null, methodName = '', request, payload}) {
  if (!test && !test === null) console.log(Date.now(), `💥 DB-API faunaQuery response '${methodName}' : Unsuccessful :`, JSON.stringify(request));
  else {
    // console.log(Date.now(), `✅ DB-API faunaQuery response '${methodName}' : Successful`, JSON.stringify(request));
    return payload;
  }
}

