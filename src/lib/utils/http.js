// ======================================================
// HTTP Helpers
// ======================================================

// HTTP methods
// ------------------------------------------------------

export function get(endpoint, token) {
  return send({ method: 'GET', endpoint, token });
}

export function del(endpoint, token) {
  return send({ method: 'DELETE', endpoint, token });
}

export function post(endpoint, data, token) {
  return send({ method: 'POST', endpoint, data, token });
}

export function put(endpoint, data, token) {
  return send({ method: 'PUT', endpoint, data, token });
}

// Fetch Utility Function
// ------------------------------------------------------

const send = async ({ method, endpoint, data, token }) => {

  // BUILD REQUEST
  const opts = { method, headers: {} };

  if (data) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(data);
  }

  if (token) {
    opts.headers['Authorization'] = `Bearer ${token}`;
  }

  // MAKE REQUEST
  try {

    // SvelteKit handles fetch universally on server & in browser
    const response = await fetch(endpoint, opts);
    const text = await response.text();

		// console.log('----------------------------------------------------------------------------------');
    // console.log(Date.now(), `: HTTP send response response.ok`, response.ok);
    // console.log(Date.now(), `: HTTP send response response.status`, response.status);
    // console.log(Date.now(), `: HTTP send response response.statusText`, response.statusText);
    // console.log(Date.now(), `: HTTP send response text`, text);

    // if response fails, throw error
    if (!response.ok) {
      let errorResponse;
      try {
        
        // if a custom error message is present in response, use it
        // NOTE - presumes error messages from endpoints will be passed back as body: { error: 'custom message' }
        // console.log(Date.now(), `: HTTP send for '${endpoint}' ERROR 1`, JSON.parse(text).error);
        errorResponse = { status: response.status, message: JSON.parse(text).error };
      } catch {
        
        // else use a user-friendly error message
        // console.log(Date.now(), `: HTTP send for '${endpoint}' ERROR 2`, response.statusText);
        errorResponse = { status: response.status, message: 'Unable to process request.' };
      }
      throw errorResponse;
    }
    
    // else continue processing request
    try {
      
      // try to parse response into JSON object
      // console.log(Date.now(), `: HTTP send for '${endpoint}' SUCCESS (json)`, JSON.parse(text));
      return {
        ok: true,
        status: response.status || 200,
        body: JSON.parse(text),
      };
    } catch (error) {
      
      // if unable to parse JSON return response as text instead
      // console.log(Date.now(), `: HTTP send for '${endpoint}' SUCCESS (text)`, text);
      return {
        ok: true,
        status: response.status || 400,
        body: text,
      };
    }
  } catch (error) {
    
    // if request unsuccessful, return error information
    // console.log(Date.now(), `: HTTP send for '${endpoint}' ERROR 3`, error);
    const errorMessage = error.message || error.toString() || 'Caught error.';
    return {
      ok: false,
      status: error.status || 400,
      body: { error: errorMessage },
    };
  }
};

