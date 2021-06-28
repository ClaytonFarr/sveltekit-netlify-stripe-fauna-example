// ======================================================
// Endpoints error response
// ======================================================

export default function errorResponse(error, endpointName = null) {

  // console.log(Date.now(), ': Helper errorResponse - error :', error);

  const errorStatus = error.status || 400;
  let errorMessage = error.message || error.toString() || 'Caught error.';

  // customized error messages
  if (endpointName === 'signupUser'
    && errorMessage.toLowerCase().includes('bad request'))
    errorMessage = 'An account for this email already exists.';

  if (endpointName === 'confirmUser'
    && errorMessage.toLowerCase().includes('bad request'))
    errorMessage = 'Unable to Confirm Account';

  if (endpointName === 'loginUser'
    && (errorMessage.toLowerCase().includes('bad request') || errorMessage.toLowerCase().includes('no user found')))
    errorMessage = 'Account not found or password is invalid.';

  if (endpointName === 'passwordRecoveryRequest'
    && (errorMessage.toLowerCase().includes('bad request') || errorMessage.toLowerCase().includes('user not found')))
    errorMessage = 'Account not found.';

  if (endpointName === 'passwordRecoveryVerify'
    && errorMessage.toLowerCase().includes('bad request'))
    errorMessage = 'Invalid password reset token.';

  if ((endpointName === 'updatePassword' || endpointName === 'updateEmailRequest' || endpointName === 'deleteUser')
    && (errorMessage.toLowerCase().includes('bad request') || error.status === 405))
    errorMessage = 'We encountered a system error - please try again.';

  if ((endpointName === 'updatePassword' || endpointName === 'updateEmailRequest')
    && (errorMessage.toLowerCase().includes('user not found') || error.status === 400))
    errorMessage = 'Please double-check current password.';

  if (endpointName === 'updateEmailConfirm'
    && errorMessage.toLowerCase().includes('bad request'))
    errorMessage = 'Unable to confirm email update token.';

  if (endpointName === 'deleteUser'
    && (errorMessage.toLowerCase().includes('user not found') || errorMessage.toLowerCase().includes('no user found')))
    errorMessage = 'Unauthorized, please double-check password.';

  if (errorStatus === 401 || errorStatus === 403 || errorMessage.toLowerCase().includes('invalid token'))
    errorMessage = 'Unauthorized Request';
  
  if (errorStatus === 502 || errorMessage.toLowerCase().includes('unexpected token'))
    errorMessage = 'We encountered a system error - please try again.';

  if (errorMessage.toLowerCase().includes('invalid refresh token'))
    errorMessage = 'Unable to renew tokens.';

  if (errorMessage.toLowerCase().includes('bad gateway'))
    errorMessage = 'Issue reaching server - please submit again.';

    // return
  return {
    ok: false,
    status: errorStatus === 404 ? 400 : errorStatus, // if API returns 404, SvelteKit seems to process response as HTML instead of XHR
    body: { error: errorMessage },
  }
}
