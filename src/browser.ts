import puppeteer from 'puppeteer';

import { waitForNetworkIdle } from './utility/waitForNetworkIdle';

interface SessionStorageKeyValue {
  key: string;
  value: string;
}

interface PageConfig {
  url: string;
  viewport?: puppeteer.Viewport; // type puppeteer.viewport
  cookies?: puppeteer.Cookie[];
  sessionStorageKeyValues?: SessionStorageKeyValue[];
  // networkIdleTime, numberOfRequests simulates networkidle
  // https://github.com/puppeteer/puppeteer/blob/v2.0.0/docs/api.md#pagegotourl-options
  networkIdleTime?: number;
  numberOfRequests?: number;
  customElement?: string;
  pdfOptions: puppeteer.PDFOptions;
}

class BrowserWrapper {
  private browser: puppeteer.Browser | null = null;

  public async getBrowser() {
    try {
      if (!this.browser) {
        this.browser = await puppeteer.launch({
          pipe: true,
          headless: true,
        });
      }
      return this.browser;
    } catch(e) {
      console.warn('puppeteer is missing', e);
      return null;
    }
  }

  public async getPdf(config: PageConfig) {
    if (!this.browser) {
      return;
    }

    const { 
      url, 
      viewport, 
      cookies, 
      sessionStorageKeyValues, 
      networkIdleTime = 500, 
      numberOfRequests = 0,
      customElement,
      pdfOptions
    } = config;

    // open new page
    const page = await this.browser.newPage();

    // set viewport
    if (viewport) {
      page.setViewport(viewport);
    }

    // set cookies
    if (cookies) {
      page.setCookie(...cookies);
    }

    // set session storage
    if (sessionStorageKeyValues) {
      await page.evaluateOnNewDocument((session: SessionStorageKeyValue[]) => {
        // puppeteer opens browser and will have window object context
        // that window object is referenced here
        session.forEach((ele) => {
          // @ts-ignore
          sessionStorage.setItem(ele.key, ele.value);
        });
        // @ts-ignore
      }, sessionStorageKeyValues);
    }

    // go to page and wait
    await Promise.all([
      page.goto(url),
      waitForNetworkIdle(page, networkIdleTime, numberOfRequests), // equivalent to 'networkidle0' when using (page, 500, 0)
    ]);

    if (customElement) {
      // create html wrapper for custom element
      // we need pdf over custom element instead full page
      // https://github.com/puppeteer/puppeteer/issues/3680
      const pdfBody = await page.$(customElement);
      if (pdfBody) {
        await page.evaluate((body: any) => {
          let node = body;
          // @ts-ignore
          const width = getComputedStyle(node).width;
          node = body.cloneNode(true);
          node.style.width = width;
          // @ts-ignore
          document.body.innerHTML = `
            <div style="display:flex;justify-content:center;align-items:center;">
              ${node.outerHTML}
            </div>
          `;
        }, pdfBody);
      }
    }

    const pdf = await page.pdf(pdfOptions);

    // close the page
    await page.close();

    return pdf;
  }

  public async closeBrowser() {
    if ( !this.browser ) {
      return;
    }
    try {
      await this.browser.close();
    }
    finally {
      this.browser = null;
    }
  }
}

export const puppeteerBrowser = new BrowserWrapper();
