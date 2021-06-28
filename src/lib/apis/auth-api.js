// ======================================================
// Netlify Identity Custom API
// ======================================================

// Methods to interact directly with a Netlify Identity (GoTrue) instance.
// These replicate the functionality of the GoTrue-JS library methods
// but are able to run server side / within serverless funcitons (e.g. do not rely on `window`)


// ------------------------------------------------------
// Netlify Identity methods
// ------------------------------------------------------

export async function signupUser(email, password) {
  if (!email) return { ok: false, status: 400, body: JSON.stringify({ error: 'An email is required.' }) };
  if (!password) return { ok: false, status: 400, body: JSON.stringify({ error: 'A password is required.' }) };
  return await ask({ method: 'POST', endpoint: 'signup', data: { email, password } })
}

export async function confirmUser(confirmationToken) {
  if (!confirmationToken) return { ok: false, status: 400, body: JSON.stringify({ error: 'A token is required.' }) };
  return await ask({ method: 'POST', endpoint: 'verify', data: { token: confirmationToken, type: 'signup' } })
}

export async function loginUser(email, password) {
  if (!email) return { ok: false, status: 400, body: JSON.stringify({ error: 'An email is required.' }) };
  if (!password) return { ok: false, status: 400, body: JSON.stringify({ error: 'A password is required.' }) };
  const data = `grant_type=password&username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
  return await ask({ method: 'POST', endpoint: 'token', data, contentType: 'urlencoded', stringify: false })
}  

export async function requestPasswordRecovery(email) {
  if (!email) return { ok: false, status: 400, body: JSON.stringify({ error: 'An email is required.' }) };
  return await ask({ method: 'POST', endpoint: 'recover', data: { email } })
}

export async function verifyPasswordRecovery(recoveryToken) {
  if (!recoveryToken) return { ok: false, status: 400, body: JSON.stringify({ error: 'A token is required.' }) };
  return await ask({ method: 'POST', endpoint: 'verify', data: { token: recoveryToken, type: 'recovery' } })
}

export async function requestNewAccessToken(refreshToken) {
  if (!refreshToken) return { ok: false, status: 400, body: JSON.stringify({ error: 'A token is required.' }) };
  const data = `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`;
  return await ask({ method: 'POST', endpoint: 'token', data, contentType: 'urlencoded', stringify: false })
}

export async function getUser(accessToken) {
  if (!accessToken) return { ok: false, status: 400, body: JSON.stringify({ error: 'A token is required.' }) };
  return await ask({ method: 'GET', endpoint: 'user', data: null, token: accessToken })
}

export async function updateUser(accessToken, data) {
  // used for update password, update email address, etc.
  if (!accessToken) return { ok: false, status: 400, body: JSON.stringify({ error: 'A token is required.' }) };
  return await ask({ method: 'PUT', endpoint: 'user', data, token: accessToken })
}

export async function confirmEmailChange(accessToken, emailChangeToken) {
  if (!accessToken || !emailChangeToken) return { ok: false, status: 400, body: JSON.stringify({ error: 'A token is required.' }) };
  return await ask({ method: 'PUT', endpoint: 'user', data: { email_change_token: emailChangeToken }, token: accessToken })
}

export async function logoutUser(accessToken) {
  if (!accessToken) return { ok: false, status: 400, body: JSON.stringify({ error: 'A token is required.' }) };
  return await ask({ method: 'POST', endpoint: 'logout', data: null, token: accessToken })
}

export async function deleteUser(accessToken) {
  // Note - this method requires an admin token, available from a serverless function's 'context.clientContext' object.
  // For this, it hits a custom serverless function as a pass thru, instead of the Netlify Indentity endpoint directly.
  // In this project, the source for this serverless function is at `src/additional_functions/delete-user.js`.
  if (!accessToken) return { ok: false, status: 400, body: JSON.stringify({ error: 'A token is required.' }) };
  return await ask({ method: 'GET', endpoint: 'delete-identity', token: accessToken, adminFunction: true })
}


// ------------------------------------------------------
// Fetch Utility Function
// ------------------------------------------------------

const ask = async ({ method, endpoint, data, token, contentType = 'json', stringify = true, includeCredentials = false, adminFunction = false }) => {

  // BUILD REQUEST
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

  // MAKE REQUEST

  // return fetch(endpoint, opts)
  // .then((r) => r.text())
  // .then((text) => {
  //   try {
  //     return JSON.parse(text);
  //   } catch (err) {
  //     return text;
  //   }
  // });

  try {

    // SvelteKit handles fetch universally on server & in browser
    const response = await fetch(`${baseUrl}${endpoint}`, opts);
    const text = await response.text();

    // console.log('----------------------------------------------------------------------------------');
    // console.log(Date.now(), `: AUTH-API ask response`, response);
    // console.log(Date.now(), `: AUTH-API ask response.ok`, response.ok);
    // console.log(Date.now(), `: AUTH-API ask response.status`, response.status);
    // console.log(Date.now(), `: AUTH-API ask response.statusText`, response.statusText);
    // console.log(Date.now(), `: AUTH-API ask response.text()`, text);

    // if response fails throw error
    if (!response.ok) {
      // if a custom error message is present in response, use it
      let errorMessage = response.statusText;
      if(response.statusText === 'Method Not Allowed') errorMessage = 'Unable to process request.';
      if(text && JSON.parse(text).error_description) errorMessage = JSON.parse(text).error_description;
      if(text && JSON.parse(text).msg) errorMessage = JSON.parse(text).msg;
      // console.log(Date.now(), `: AUTH-API ask for '${endpoint}' ERROR 1`, errorMessage);
      const errorResponse = { status: response.status, message: errorMessage };
      throw errorResponse;
    }

    // else continue processing request
    try {

      // try to parse response into JSON object
      // console.log(Date.now(), `: AUTH-API ask for '${endpoint}' SUCCESS (json)`, JSON.parse(text));
      return {
        ok: true,
        status: response.status,
        body: JSON.parse(text),
      };
    } catch (error) {
      
      // if unable to parse JSON return response as text instead
      // console.log(Date.now(), `: AUTH-API ask for '${endpoint}' SUCCESS (text)`, text);
      return {
        ok: true,
        status: response.status,
        body: text,
      };
    }
  } catch (error) {
    // if request unsuccessful, return error information
    // console.log(Date.now(), `: AUTH-API ask for '${endpoint}' ERROR 2`, error);
    const errorMessage = error.message || error.toString() || 'Caught error.';
    return {
      ok: false,
      status: error.status,
      body: { error: errorMessage },
    };
  }
};


// ------------------------------------------------------
// Cookie Utility Functions
// ------------------------------------------------------

const JWT_COOKIE_NAME = 'id_jwt';

export const parseIdentityCookies = (request) => {
  const cookies = request.headers.cookie;
  let jwt = null;
  // grab JWT value, if cookie is present
  if (cookies) jwt = cookies.split('; ').find((row) => row.startsWith(JWT_COOKIE_NAME))
  if (jwt) jwt = jwt.slice(JWT_COOKIE_NAME.length + 1);
  return { jwt }
}

export function setIdentityCookies(status, body, token, redirection = null) {
  // construct header
  const headers = { 'Set-Cookie': `${JWT_COOKIE_NAME}=${token}; Path=/; SameSite=Lax; HttpOnly; Secure; Max-Age=3600;` };
  if (redirection) headers['Location'] = redirection;
  // wrap passed status & body with JWT cookie
  return {
    ok: true,
    status: redirection ? 302 : status,
    headers,
    body,
  };
}

export const deleteIdentityCookies = (status, body, redirection = null) => {
  // construct header
  const headers = { 'Set-Cookie': `${JWT_COOKIE_NAME}=; Path=/; SameSite=Lax; HttpOnly; Secure; Max-Age=0;` };
  if (redirection) headers['Location'] = redirection;
  // wrap passed status & body with null value cookie
  return {
    ok: true,
    status: redirection ? 302 : status,
    headers,
    body,
  };
}