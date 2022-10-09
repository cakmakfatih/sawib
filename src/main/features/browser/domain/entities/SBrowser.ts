import { FirefoxBrowser, BrowserContext } from 'playwright-firefox';

interface SBrowser {
  browser: FirefoxBrowser;
  context: BrowserContext;
}

export default SBrowser;
