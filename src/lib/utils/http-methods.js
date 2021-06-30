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

// Fetch utility
// ------------------------------------------------------

// Helper method that returns JSON (or text fallback)

const send = async ({ method, endpoint, data, token }) => {

  const opts = { method, headers: {} };

  if (data) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(data);
  }

  if (token) {
    opts.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(endpoint, opts);
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

