// ====================================================================================
// Helpers
// ====================================================================================

// Server Response Utilities
// ------------------------------------------------------------------------------------
// Used to provide common structure to endpoint/serverless function responses
// For errors, stick to the basics of HTTP and avoid hunting for obscure error codes:
// - use 500 errors for application failing to do its job
//    response(500)
// - use 404 for things that aren't found
//    response(404)
// - use 200 with an 'error' message for everything else
//    response(200, {
//       "error": "This is what went wrong"
//    })

export function serverResponse(statusCode, successful = true, body = {}, headers = null) {
  // use for SvelteKit .js endpoints (returns code as 'status')
  // do not user for 'additional_functions' functions (need to return code as 'statusCode')

  // set statusMessage
  let statusMessage;
  if (successful) { statusMessage = 'success' };
  if (!successful && !body.statusMessage) { statusMessage = 'error' };

  // set errorMessage
  let errorMessage = body.error;
  if ((statusCode === 405 || statusCode === 502) && !body.error) errorMessage = 'Issue reaching server - please submit again.';
  if ((statusCode === 500 && !body.error) || body.error?.toLowerCase().includes('unexpected token')) errorMessage = 'We encountered a system error - please try again.';
  if ((statusCode === 401 || statusCode === 403) && !body.error) errorMessage = 'Unauthorized Request';
  if (statusCode === 200 && !successful && !body.error) { errorMessage = 'Request error.' };
  if (statusCode === 404 && !body.error) { errorMessage = 'Item not found.' };

  // compose body
  if (successful) body = { statusMessage, ...body };
    else body = { statusMessage, error: errorMessage, ...body };

  return {
    status: statusCode,
    headers,
    body: JSON.stringify(body),
  }
}



// Validate JSON
// ------------------------------------------------------------------------------------
export function isValidJSONString(str) {
  try {
      JSON.parse(str);
  } catch (e) {
      return false;
  }
  return true;
}


// Validate Email
// ------------------------------------------------------------------------------------
export const validateEmailAddress = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}


// Decode JWT
// ------------------------------------------------------------------------------------
export const parseJwt = (jwt) => {
  const base64Url = jwt.split('.')[1];
  if(base64Url) {
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const buff = Buffer.from(base64, 'base64');
    const payloadInit = buff.toString('ascii');
    if (isValidJSONString(payloadInit)) {
      return JSON.parse(payloadInit);
    }
  }
};


// Debounce
// ------------------------------------------------------------------------------------
export const debounce = (callback, time = 250, interval) => (...args) => {
  clearTimeout(
    interval,
    (interval = setTimeout(() => callback(...args), time))
  );
}


// Delay (https://github.com/wesbos/waait)
// ------------------------------------------------------------------------------------
export const wait = (amount = 0) => new Promise(resolve => setTimeout(resolve, amount));
// returns promise that resolves after how X milliseconds; e.g. -
// async function doStuff() {
//  doSomething();
//  await wait();
//  doSomethingElse();
//  await wait(200);
//  console.log('200ms later');
// }


// Autofocus first child input
// ------------------------------------------------------------------------------------
export function autoFocusFirstChildInput(node, delay = 100) {
  const input = node.querySelector('input, textarea, select');
  input.classList.add('autofocused');
  setTimeout(() => input.focus(), delay);
}
