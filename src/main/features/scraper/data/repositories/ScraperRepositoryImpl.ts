import { Either, Left, Right } from '@typed-f/either';
import { Failure, ScraperFailure } from '../../../../core/error/failures';
import { Page, Response, ElementHandle } from 'playwright-firefox';
import ScraperRepository from '../../domain/repositories/ScraperRepository';
import { inject, injectable } from 'tsyringe';
import Tokens from '../../../../bin/Tokens';
import Logger from '../../../../core/Logger';
import { ScraperLocalDataSource } from '../datasources/ScraperLocalDataSource';
import { INewBot } from '../../../bot/domain/usecases/NewBot';
import { ILaunchBrowser } from '../../../browser/domain/usecases/LaunchBrowser';
import BotController from '../../../bot/presentation/controllers/BotController';
import safePromise from '../../../../utils/safePromise';
import ScraperConfig from '../../domain/entities/ScraperConfig';
import fs from 'fs';
import moment from 'moment';
import path from 'path';
import safeCall from '../../../../utils/safeCall';

export const SCRAPER_LAUNCH_BROWSER_WARNING_MESSAGE = "Failed on [LaunchBrowser] call from [ScraperRepository].";
export const SCRAPER_NEW_BOT_WARNING_MESSAGE = "Failed on [NewBot] call made from [ScraperRepository].";
export const SCRAPER_BOT_CONTROLLER_INITIALIZE_WARNING_MESSAGE = "Failed on [BotController.initialize] call made from [ScraperRepository].";

export const SCRAPER_BOT_LOGIN_TO_PARTS_CHECK_FAILURE_MESSAGE = "Failed on [BotRepository.loginToPartsCheck].";
export const SCRAPER_PAGE_NAVIGATION_FAILURE_MESSAGE = "Failed while running [page.goto] method.";

export const SCRAPER_ELEMENT_HANDLES_FAILURE_MESSAGE = "Failed while running [<locator>.elementHandles].";
export const SCRAPER_GET_ATTRIBUTE_FAILURE_MESSAGE = "Failed while running [<element>.getAttribute].";
export const SCRAPER_PAGE_FILL_FAILURE_MESSAGE = "Failed while running [<page>.fill].";
export const SCRAPER_PAGE_CLICK_FAILURE_MESSAGE = "Failed while running [<page>.click].";
export const SCRAPER_PAGE_WAIT_FOR_FAILURE_MESSAGE = "Failed while running [<locator>.waitFor].";

export const FS_WRITE_FILE_SYNC_FAILURE_MESSAGE = "Failed while running [<fs>.writeFileSync] on [ScraperRepository.savePartNumbersAsCsv].";

export const SCRAPER_LOCAL_DATA_SOURCE_SET_SCRAPER_CONFIG_FAILURE_MESSAGE = "Failed while running [<localDataSource>.setScraperConfig].";

export const PARTS_CHECK_LOGIN_URL = "https://partscheck.com.au/global/login.php";

export enum Selectors {
  partNumberInp = ".partNr",
  loginUsernameInp = "#myuser",
  loginPasswordInp = "#mypass",
  loginBtn = "#loginButton",
  isLoggedIn = "#Xtop-header > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(4) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > a:nth-child(1)",
}

@injectable()
class ScraperRepositoryImpl implements ScraperRepository {
  private readonly logger: Logger;
  private readonly localDataSource: ScraperLocalDataSource;
  private readonly launchBrowser: ILaunchBrowser;
  private readonly newBot: INewBot;

  constructor(
    @inject(Tokens.logger) logger: Logger,
    @inject(Tokens.scraperLocalDataSource) localDataSource: ScraperLocalDataSource,
    @inject(Tokens.launchBrowser) launchBrowser: ILaunchBrowser,
    @inject(Tokens.newBot) newBot: INewBot,
  ) {
    this.logger = logger;
    this.localDataSource = localDataSource;
    this.launchBrowser = launchBrowser;
    this.newBot = newBot;
  }

  private async launchBotController(): Promise<Either<Failure, BotController>> {
    const stealthBrowserOrFailure = await this.launchBrowser();

    if (stealthBrowserOrFailure.isLeft()) {
      this.logger.info("[ScraperRepository.scrapePartNumber] completed with a [Failure].");
      this.logger.warn(SCRAPER_LAUNCH_BROWSER_WARNING_MESSAGE);

      return new Left(stealthBrowserOrFailure.value);
    }

    const stealthBrowser = stealthBrowserOrFailure.value;

    const botControllerOrFailure = await this.newBot(stealthBrowser);

    if (botControllerOrFailure.isLeft()) {
      this.logger.info("[ScraperRepository.scrapePartNumber] completed with a [Failure].");
      this.logger.warn(SCRAPER_NEW_BOT_WARNING_MESSAGE);

      await stealthBrowser.context.close();
      await stealthBrowser.browser.close();

      return new Left(botControllerOrFailure.value);
    }

    const botController = botControllerOrFailure.value;

    const initializedOrFailed = await botController.initialize();

    if (initializedOrFailed.isLeft()) {
      this.logger.info("[ScraperRepository.scrapePartNumber] completed with a [Failure].");
      this.logger.warn(SCRAPER_BOT_CONTROLLER_INITIALIZE_WARNING_MESSAGE);

      await stealthBrowser.context.close();
      await stealthBrowser.browser.close();

      return new Left(initializedOrFailed.value);
    }

    return new Right(botController);
  }

  async scrapePartNumber(url: string): Promise<Either<Failure, boolean>> {
    this.logger.info("[ScraperRepository.scrapePartNumber] started.");

    const botOrFailure = await this.launchBotController();

    if (botOrFailure.isLeft()) {
      return new Left(botOrFailure.value);
    }

    const bot = botOrFailure.value;

    const page = bot.pages[0];

    const loggedInOrFailed = await this.loginToPartsCheck(page);

    if (loggedInOrFailed.isLeft()) {
      await bot.stealthBrowser.context.close();
      await bot.stealthBrowser.browser.close();

      this.logger.info("[ScraperRepository.scrapePartNumber] completed with a [Failure].");
      this.logger.warn(SCRAPER_BOT_CONTROLLER_INITIALIZE_WARNING_MESSAGE);

      return new Left(loggedInOrFailed.value);
    }

    const navigatedToUrlOrFailed = await safePromise<null | Response>(() => page.goto(url));

    if (navigatedToUrlOrFailed.isLeft()) {
      await bot.stealthBrowser.context.close();
      await bot.stealthBrowser.browser.close();

      const navigationErr = navigatedToUrlOrFailed.value;

      this.logger.info("[ScraperRepository.scrapePartNumber] completed with a [Failure].");
      this.logger.warn(SCRAPER_PAGE_NAVIGATION_FAILURE_MESSAGE);
      this.logger.error(navigationErr);

      return new Left(new ScraperFailure(SCRAPER_PAGE_NAVIGATION_FAILURE_MESSAGE, navigationErr));
    }

    const partNumbersLocator = page.locator(Selectors.partNumberInp);
    const partNumberInpElementsOrFailure = await safePromise<ElementHandle<Node>[]>(() => partNumbersLocator.elementHandles());

    if (partNumberInpElementsOrFailure.isLeft()) {
      await bot.stealthBrowser.context.close();
      await bot.stealthBrowser.browser.close();

      const elementHandlesErr = partNumberInpElementsOrFailure.value;

      this.logger.info("[ScraperRepository.scrapePartNumber] completed with a [Failure].");
      this.logger.warn(SCRAPER_ELEMENT_HANDLES_FAILURE_MESSAGE);
      this.logger.error(elementHandlesErr);

      return new Left(new ScraperFailure(SCRAPER_ELEMENT_HANDLES_FAILURE_MESSAGE, elementHandlesErr));
    }

    const partNumberInpElements = partNumberInpElementsOrFailure.value;

    const partNumberValues: string[] = [];

    for (let partNumberInp of partNumberInpElements) {
      const partNumberOrFailure = await safePromise<string | null>(() => partNumberInp.getAttribute("value"));

      if (partNumberOrFailure.isLeft()) {
        await bot.stealthBrowser.context.close();
        await bot.stealthBrowser.browser.close();

        const getAttributeErr = partNumberOrFailure.value;

        this.logger.info("[ScraperRepository.scrapePartNumber] completed with a [Failure].");
        this.logger.warn(SCRAPER_GET_ATTRIBUTE_FAILURE_MESSAGE);
        this.logger.error(getAttributeErr);

        return new Left(new ScraperFailure(SCRAPER_GET_ATTRIBUTE_FAILURE_MESSAGE, getAttributeErr));
      }

      const partNumber = partNumberOrFailure.value;

      partNumberValues.push(partNumber ?? "");
    }

    const partNumbersSavedOrFailed = this.savePartNumbersAsCsv(partNumberValues);

    if (partNumbersSavedOrFailed.isLeft()) {
      const failure = partNumbersSavedOrFailed.value;

      await bot.stealthBrowser.context.close();
      await bot.stealthBrowser.browser.close();

      this.logger.info("[ScraperRepository.scrapePartNumber] completed with a [Failure].");

      return new Left(failure);
    }

    await bot.stealthBrowser.context.close();
    await bot.stealthBrowser.browser.close();

    const partNumberSaveResult = partNumbersSavedOrFailed.value;

    this.logger.info("[ScraperRepository.scrapePartNumber] completed.");

    return new Right(partNumberSaveResult);
  }

  async loginToPartsCheck(page: Page): Promise<Either<Failure, boolean>> {
    this.logger.info("[ScraperRepository.loginToPartsCheck] started.");

    const scraperConfigOrFailure = this.getScraperConfig();

    if (scraperConfigOrFailure.isLeft()) {
      const getScraperConfigFailure = scraperConfigOrFailure.value;
      this.logger.info("[ScraperRepository.loginToPartsCheck] completed with a [Failure].");

      await page.close();

      return new Left(getScraperConfigFailure);
    }

    const navigatedToUrlOrFailed = await safePromise<null | Response>(() => page.goto(PARTS_CHECK_LOGIN_URL));

    if (navigatedToUrlOrFailed.isLeft()) {
      await page.close();

      const navigationErr = navigatedToUrlOrFailed.value;

      this.logger.info("[ScraperRepository.loginToPartsCheck] completed with a [Failure].");
      this.logger.warn(SCRAPER_PAGE_NAVIGATION_FAILURE_MESSAGE);
      this.logger.error(navigationErr);

      return new Left(new ScraperFailure(SCRAPER_PAGE_NAVIGATION_FAILURE_MESSAGE, navigationErr));
    }

    const scraperConfig = scraperConfigOrFailure.value;

    const filledInputsOrFailed = await this.fillCredentialInputs({
      page,
      username: scraperConfig.partsCheckCredentials.username,
      password: scraperConfig.partsCheckCredentials.password,
    });

    if (filledInputsOrFailed.isLeft()) {
      await page.close();

      const fillInputFailure: ScraperFailure = filledInputsOrFailed.value;
      const fillInputErr = fillInputFailure.error;

      this.logger.info("[ScraperRepository.loginToPartsCheck] completed with a [Failure].");
      this.logger.warn(SCRAPER_PAGE_FILL_FAILURE_MESSAGE);
      this.logger.error(fillInputErr!);

      return new Left(new ScraperFailure(SCRAPER_PAGE_FILL_FAILURE_MESSAGE, fillInputErr));
    }

    const clickedOrFailed = await safePromise<void>(() => page.click(Selectors.loginBtn));

    if (clickedOrFailed.isLeft()) {
      await page.close();

      const clickErr = clickedOrFailed.value;

      this.logger.info("[ScraperRepository.loginToPartsCheck] completed with a [Failure].");
      this.logger.warn(SCRAPER_PAGE_CLICK_FAILURE_MESSAGE);
      this.logger.error(clickErr);

      return new Left(new ScraperFailure(SCRAPER_PAGE_CLICK_FAILURE_MESSAGE, clickErr));
    }

    const authenticationLocator = page.locator(Selectors.isLoggedIn);

    const authenticatedOrFailed = await safePromise<void>(() => authenticationLocator.waitFor({ state: "visible" }));

    if (authenticatedOrFailed.isLeft()) {
      await page.close();

      const waitForErr = authenticatedOrFailed.value;

      this.logger.info("[ScraperRepository.loginToPartsCheck] completed with a [Failure].");
      this.logger.warn(SCRAPER_PAGE_WAIT_FOR_FAILURE_MESSAGE);
      this.logger.error(waitForErr);

      return new Left(new ScraperFailure(SCRAPER_PAGE_WAIT_FOR_FAILURE_MESSAGE, waitForErr));
    }

    this.logger.info("[ScraperRepository.loginToPartsCheck] completed.");

    return new Right(true);
  }

  savePartNumbersAsCsv(partNumbers: string[]): Either<Failure, boolean> {
    this.logger.info("[ScraperRepository.savePartNumbersAsCsv] started.");

    const scraperConfigOrFailure = this.getScraperConfig();

    if (scraperConfigOrFailure.isLeft()) {
      const scraperConfigFailure = scraperConfigOrFailure.value;

      this.logger.info("[ScraperRepository.savePartNumbersAsCsv] completed with a [Failure].");

      return new Left(scraperConfigFailure);
    }

    const scraperConfig = scraperConfigOrFailure.value;

    const fileName = `${moment().utc().format("YYYY-MM-DD HH-MM-SS").toString()}.csv`;
    const pathToSave = path.join(scraperConfig.partNumberSavePath, fileName);

    partNumbers = partNumbers.map((i) => `"${i.replace(/-| /g, "")}"`);

    const fileSavedOrFailed = safeCall(() => fs.writeFileSync(pathToSave, partNumbers.join("\n"), { encoding: "utf-8" }));

    if (fileSavedOrFailed.isLeft()) {
      const fsWriteFileSyncErr = fileSavedOrFailed.value;

      this.logger.info("[ScraperRepository.savePartNumbersAsCsv] completed with a [Failure].");
      this.logger.warn(FS_WRITE_FILE_SYNC_FAILURE_MESSAGE);
      this.logger.error(fsWriteFileSyncErr);

      return new Left(new ScraperFailure(FS_WRITE_FILE_SYNC_FAILURE_MESSAGE, fsWriteFileSyncErr));
    }

    this.logger.info(`[ScraperRepository.savePartNumbersAsCsv] saved CSV file to ${pathToSave}.`);

    this.logger.info("[ScraperRepository.savePartNumbersAsCsv] completed.");

    return new Right(true);
  }

  setScraperConfig(config: ScraperConfig): Either<Failure, boolean> {
    this.logger.info("[ScraperRepository.setScraperConfig] started.");

    const savedOrFailed = safeCall<boolean>(() => this.localDataSource.setScraperConfig(config));

    if (savedOrFailed.isLeft()) {
      const setScraperConfigErr = savedOrFailed.value;

      this.logger.warn(SCRAPER_LOCAL_DATA_SOURCE_SET_SCRAPER_CONFIG_FAILURE_MESSAGE);
      this.logger.error(setScraperConfigErr);

      this.logger.info("[ScraperRepository.setScraperConfig] completed with a [Failure].");

      return new Left(new ScraperFailure(SCRAPER_LOCAL_DATA_SOURCE_SET_SCRAPER_CONFIG_FAILURE_MESSAGE, setScraperConfigErr));
    }

    this.logger.info("[ScraperRepository.setScraperConfig] completed.");

    return new Right(true);
  }

  getScraperConfig(): Either<Failure, ScraperConfig> {
    throw new Error('Method not implemented.');
  }

  private async fillCredentialInputs({ page, username, password }: { page: Page; username: string; password: string; }): Promise<Either<Failure, boolean>> {
    try {
      await page.fill(Selectors.loginUsernameInp, username);
      await page.fill(Selectors.loginPasswordInp, password);

      return new Right(true);
    } catch (error) {
      if (error instanceof Error)
        return new Left(new ScraperFailure(SCRAPER_PAGE_FILL_FAILURE_MESSAGE, error));

      return new Left(new ScraperFailure(SCRAPER_PAGE_FILL_FAILURE_MESSAGE, new Error("Unexpected error.")));
    }
  }
}

export default ScraperRepositoryImpl;
