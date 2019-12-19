// control network idle times and number of requests
// https://github.com/puppeteer/puppeteer/issues/1353#issuecomment-356561654
export const waitForNetworkIdle = (page: any, timeout: any, maxInflightRequests = 0) => {
  page.on('request', onRequestStarted);
  page.on('requestfinished', onRequestFinished);
  page.on('requestfailed', onRequestFinished);

  let inflight = 0;
  let fulfill: any;
  const promise = new Promise((x) => {fulfill = x;});
  let timeoutId = setTimeout(onTimeoutDone, timeout);
  return promise;

  function onTimeoutDone() {
    page.removeListener('request', onRequestStarted);
    page.removeListener('requestfinished', onRequestFinished);
    page.removeListener('requestfailed', onRequestFinished);
    fulfill();
  }

  function onRequestStarted() {
    ++inflight;
    if (inflight > maxInflightRequests) {
      clearTimeout(timeoutId);
    }
  }
  
  function onRequestFinished() {
    if (inflight === 0) {
      return;
    }
    --inflight;
    if (inflight === maxInflightRequests) {
      timeoutId = setTimeout(onTimeoutDone, timeout);
    }
  }
}
