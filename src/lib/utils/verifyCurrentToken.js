// ======================================================
// Verify current JWT cookie access token
// ======================================================

import * as auth from '$lib/apis/auth-api';

export default async function verifyCurrentToken(token) {
  if (!token) return { ok: false, status: 400, body: JSON.stringify({ error: 'JWT token not present.' }) };
  const accessTokenCheck = await auth.getUser(token);
  // a valid token will return a user object with email address; an invalid token will return 401 

  // console.log(Date.now(), ': Helper verifyCurrentToken - accessTokenCheck :', accessTokenCheck);

  // if accessTokenCheck fails, throw error
  if (accessTokenCheck.body.code === 401 || !accessTokenCheck.body.email) throw { ok: false, status: accessTokenCheck.status, message: accessTokenCheck.body.msg, };

  // else, return success + Netlify Identity token check response
  return {
    ok: true,
    status: 200,
    body: accessTokenCheck.body,
  }
}
