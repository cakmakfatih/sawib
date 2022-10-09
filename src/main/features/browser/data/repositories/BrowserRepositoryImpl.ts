import { Either, Left, Right } from '@typed-f/either';
import { BrowserFailure, Failure } from '../../../../core/error/failures';
import Logger from '../../../../core/Logger';
import Tokens from '../../../../bin/Tokens';
import StealthBrowser from '../../domain/entities/StealthBrowser';
import StealthBrowserLaunchOptions from '../../domain/entities/StealthBrowserLaunchOptions';
import BrowserRepository from '../../domain/repositories/BrowserRepository';
import { inject, injectable } from 'tsyringe';
import { BrowserType, Browser, BrowserContext, FirefoxBrowser } from 'playwright-firefox';
import safePromise from '../../../../utils/safePromise';
import { DEFAULT_ABOUT_CONFIG, DEFAULT_LAUNCH_OPTIONS } from '../../bin/config';
import AboutConfig from '../../domain/entities/AboutConfig';

export const BROWSER_LAUNCH_FAILURE_MESSAGE = "Failed while launching the browser.";
export const CREATE_CONTEXT_FAILURE_MESSAGE = "Failed while creating a context.";

@injectable()
class BrowserRepositoryImpl implements BrowserRepository {
  private readonly logger: Logger;
  private readonly firefox: BrowserType<Browser>;

  constructor(
    @inject(Tokens.logger) logger: Logger,
    @inject(Tokens.firefox) firefox: BrowserType<Browser>,
  ) {
    this.logger = logger;
    this.firefox = firefox;
  }

  async launch(params?: StealthBrowserLaunchOptions): Promise<Either<Failure, StealthBrowser>> {
    this.logger.info("[BrowserRepository.launch] started.");

    let aboutConfig: AboutConfig = { ...DEFAULT_ABOUT_CONFIG, ...params?.firefoxUserPrefs };

    if (!params) {
      params = { ...DEFAULT_LAUNCH_OPTIONS, firefoxUserPrefs: aboutConfig };
    } else {
      params = { ...DEFAULT_LAUNCH_OPTIONS, ...params, firefoxUserPrefs: aboutConfig };
    }

    const browserOrFailure = await safePromise<Browser>(() => this.firefox.launch(params));

    if (browserOrFailure.isLeft()) {
      this.logger.warn(BROWSER_LAUNCH_FAILURE_MESSAGE);
      this.logger.error(browserOrFailure.value);

      return new Left(new BrowserFailure(BROWSER_LAUNCH_FAILURE_MESSAGE, browserOrFailure.value));
    }

    const browser = browserOrFailure.value;

    const contextOrFailure = await safePromise<BrowserContext>(() => this.createContext(browser));

    if (contextOrFailure.isLeft()) {
      await browser.close();

      this.logger.warn(CREATE_CONTEXT_FAILURE_MESSAGE);
      this.logger.error(contextOrFailure.value);

      return new Left(new BrowserFailure(CREATE_CONTEXT_FAILURE_MESSAGE, contextOrFailure.value));
    }

    const context = contextOrFailure.value;

    const stealthBrowser: StealthBrowser = {
      browser,
      context,
    };

    this.logger.info("[BrowserRepository.launch] completed.");

    return new Right(stealthBrowser);
  }

  private async createContext(browser: FirefoxBrowser): Promise<BrowserContext> {
    return await browser.newContext();
  }
}

export default BrowserRepositoryImpl;
