import { FirefoxBrowser, BrowserContext } from 'playwright-firefox';

interface StealthBrowser {
  browser: FirefoxBrowser;
  context: BrowserContext;
}

export default StealthBrowser;
