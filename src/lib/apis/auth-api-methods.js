// ======================================================
// Netlify Identity Custom API
// ======================================================

// Methods to interact directly with a Netlify Identity (GoTrue) instance.
// These replicate the functionality of the GoTrue-JS library methods
// but are able to run server side / within serverless functions (e.g. do not rely on `window`)


// ------------------------------------------------------
// Netlify Identity methods
// ------------------------------------------------------

export async function signupUser(email, password) {
  if (!email) return errorResponse({ error: 'An email is required.' });
  if (!password) return errorResponse({ error: 'A password is required.' });
  return await ask({ method: 'POST', endpoint: 'signup', data: { email, password } })
}

export async function confirmUser(confirmationToken) {
  if (!confirmationToken) return errorResponse({ error: 'A token is required.' });
  return await ask({ method: 'POST', endpoint: 'verify', data: { token: confirmationToken, type: 'signup' } })
}

export async function loginUser(email, password) {
  if (!email) return errorResponse({ error: 'An email is required.' });
  if (!password) return errorResponse({ error: 'A password is required.' });
  const data = `grant_type=password&username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
  return await ask({ method: 'POST', endpoint: 'token', data, contentType: 'urlencoded', stringify: false })
}  

export async function requestPasswordRecovery(email) {
  if (!email) return errorResponse({ error: 'An email is required.' });
  return await ask({ method: 'POST', endpoint: 'recover', data: { email } })
}

export async function verifyPasswordRecovery(recoveryToken) {
  if (!recoveryToken) return errorResponse({ error: 'A token is required.' });
  return await ask({ method: 'POST', endpoint: 'verify', data: { token: recoveryToken, type: 'recovery' } })
}

export async function requestNewAccessToken(refreshToken) {
  if (!refreshToken) return errorResponse({ error: 'A token is required.' });
  const data = `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`;
  return await ask({ method: 'POST', endpoint: 'token', data, contentType: 'urlencoded', stringify: false })
}

export async function getUser(accessToken) {
  if (!accessToken) return errorResponse({ error: 'A token is required.' });
  return await ask({ method: 'GET', endpoint: 'user', data: null, token: accessToken })
}

export async function updateUser(accessToken, data) {
  // used for update password, update email address, etc.
  if (!accessToken) return errorResponse({ error: 'A token is required.' });
  return await ask({ method: 'PUT', endpoint: 'user', data, token: accessToken })
}

export async function confirmEmailChange(accessToken, emailChangeToken) {
  if (!accessToken || !emailChangeToken) return errorResponse({ error: 'A token is required.' });
  return await ask({ method: 'PUT', endpoint: 'user', data: { email_change_token: emailChangeToken }, token: accessToken })
}

export async function logoutUser(accessToken) {
  if (!accessToken) return errorResponse({ error: 'A token is required.' });
  return await ask({ method: 'POST', endpoint: 'logout', data: null, token: accessToken })
}

export async function deleteUser(accessToken) {
  // Note - this method requires an admin token, available from a serverless function's 'context.clientContext' object.
  // For this, it hits a custom serverless function as a pass thru, instead of the Netlify Identity endpoint directly.
  // In this project, the source for this serverless function is at `src/additional_functions/delete-user.js`.
  if (!accessToken) return errorResponse({ error: 'A token is required.' });
  return await ask({ method: 'GET', endpoint: 'delete-identity', token: accessToken, adminFunction: true })
}

export async function verifyCurrentToken(token) {
  if (!token) return errorResponse({ error: 'JWT token not present.' });
  const tokenCheck = await getUser(token);
  // a valid token will return a user object with email address; an invalid token will return 401 
  if (tokenCheck.status === 401 || !tokenCheck.email) return { ok: false, statusMessage: 'error', error: tokenCheck.statusText };
  return { ok: true, statusMessage: 'success', ...tokenCheck };
}

// ------------------------------------------------------
// Error response utility
// ------------------------------------------------------

function errorResponse(statusCode = 200, body = {}) {
  let errorMessage = 'Request error.';
  if (statusCode === 404) { errorMessage = 'Item not found.' };
  if (statusCode === 500) { errorMessage = 'Application error.' };
  body = { statusMessage: 'error', error: errorMessage, ...body }
  return {
    status: statusCode,
    body: JSON.stringify(body),
  }
}


// ------------------------------------------------------
// Fetch utility
// ------------------------------------------------------

// Helper method that returns JSON (or text fallback)

const ask = async ({ method, endpoint, data, token, contentType = 'json', stringify = true, includeCredentials = false, adminFunction = false }) => {

  const opts = { method, headers: {} };
  const baseUrl = !adminFunction ? `${process.env['URL']}/.netlify/identity/` : `${process.env['URL']}/.netlify/functions/`;

  if (data && stringify)
    opts.body = JSON.stringify(data);

  if (data && !stringify)
    opts.body = data;

  if (data && contentType === 'json')
    opts.headers['Content-Type'] = 'application/json';

  if (data && contentType === 'urlencoded')
    opts.headers['Content-Type'] = 'application/x-www-form-urlencoded';

  if (token)
    opts.headers['Authorization'] = `Bearer ${token}`;

  if (includeCredentials)
    opts.credentials = 'include';

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, opts);
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
