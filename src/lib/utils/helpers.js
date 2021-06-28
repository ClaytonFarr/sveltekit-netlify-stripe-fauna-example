// ======================================================
// Helpers
// ======================================================

// Validate JSON
export function isValidJSONString(str) {
  try {
      JSON.parse(str);
  } catch (e) {
      return false;
  }
  return true;
}

// Validate Email
export const validateEmailAddress = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

// Decode JWT
export const parseJwt = (jwt) => {
  const base64Url = jwt.split('.')[1];
  if(base64Url) {
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const buff = Buffer.from(base64, 'base64');
    const payloadinit = buff.toString('ascii');
    if (isValidJSONString(payloadinit)) {
      return JSON.parse(payloadinit);
    }
  }
};

// Debounce
export const debounce = (callback, time = 250, interval) => (...args) => {
  clearTimeout(
    interval,
    (interval = setTimeout(() => callback(...args), time))
  );
}

// Manufactured Delay (https://github.com/wesbos/waait)
// Returns promise that resolves after how X milliseconds; e.g. -
//    async function doStuff() {
//      doSomething();
//      await wait();
//      doSomethingElse();
//      await wait(200);
//      console.log('200ms later');
//    }
export const wait = (amount = 0) => new Promise(resolve => setTimeout(resolve, amount));


// Reporting
// Not currently in use; when wanted add 'VITE_SHOW_DEV_LOGS=true' var to .env as well
function log({ label, value = null, silence = false, separator = false, thinSeparator = false }) {
  if (!silence) {
    if (separator) thinSeparator
      ? console.log('-------------------------------------------------------------')
      : console.log('=============================================================');
    if (label && value) return console.log(Date.now(), `: ${label} →`, value);
    if (label) return console.log(Date.now(), `: ${label}`);
  }
  return;
}
export function devLog({label, value = null, silence = false, separator = false, thinSeparator = false}) {
  const showReports = process.env['VITE_SHOW_DEV_LOGS'] === "true"; // flag to enable/disable logs application wide (must restart server)
  const inDev = process.env['NODE_ENV'] === 'development'; // don't show these logs in production
  if (showReports && inDev) log({ label, value, silence, separator, thinSeparator });
  return;
}
export function serverLog({ label, value = null, silence = false, separator = false, thinSeparator = false }) {
  log({ label, value, silence, separator, thinSeparator });
}