## Puppeteer Browser

>Note: This package is dependent on [puppeteer](https://www.npmjs.com/package/puppeteer).

### Launching the browser

```typescript
// to the file where the browser needs to be launched
import { puppeteerBrowser } from '@code/puppeteer-browser';

// start headless browser
puppeteerBrowser.getBrowser();

// its better to launch browser on root level
// so browser need not to be launched on each action
```

### Get PDF

```typescript
import { puppeteerBrowser } from '@code/puppeteer-browser';

puppeteerBrowser.getPdf({
  url: string; // page url
  viewport?: puppeteer.Viewport; // page viewport 
  cookies?: puppeteer.Cookie[]; // page cookies
  sessionStorageKeyValues?: SessionStorageKeyValue[]; // sessionStorage in key value pairs
  networkIdleTime?: number; // wait for milliseconds before continuing
  numberOfRequests?: number;
  customElement?: string; // pdf for a custom element instead full page. (eg '#pdfBody', using id selector syntax)
  pdfOptions: puppeteer.PDFOptions
});
```


### Closing the browser

```typescript
import { puppeteerBrowser } from '@code/puppeteer-browser';

// close the browser
puppeteerBrowser.closeBrowser();
```
