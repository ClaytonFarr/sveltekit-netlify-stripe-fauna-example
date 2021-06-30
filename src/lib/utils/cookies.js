// ======================================================
// Cookie Utilities
// ======================================================

import { serverResponse } from '$lib/utils/helpers';

// ------------------------------------------------------
// Authentication cookie utilities
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

export function setIdentityCookies(body, token, redirection = null) {
  const headers = { 'Set-Cookie': `${JWT_COOKIE_NAME}=${token}; Path=/; SameSite=Lax; HttpOnly; Secure; Max-Age=3600;` };
  if (redirection) headers['Location'] = redirection;
  return serverResponse(redirection ? 302 : 200, true, body, headers);
}

export const deleteIdentityCookies = (body, redirection = null) => {
  const headers = { 'Set-Cookie': `${JWT_COOKIE_NAME}=; Path=/; SameSite=Lax; HttpOnly; Secure; Max-Age=0;` };
  if (redirection) headers['Location'] = redirection;
  return serverResponse(redirection ? 302 : 200, true, body, headers);
}