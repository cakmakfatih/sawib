import { Either, Left, Right } from '@typed-f/either';
import { Failure } from '../../../../core/error/failures';
import { Page } from 'playwright-firefox';
import ScraperRepository from '../../domain/repositories/ScraperRepository';
import { ScrapePartNumberParams } from '../../domain/usecases/ScrapePartNumber';
import { inject, injectable } from 'tsyringe';
import Tokens from '../../../../bin/Tokens';
import Logger from '../../../../core/Logger';
import { ScraperLocalDataSource } from '../datasources/ScraperLocalDataSource';
import { INewBot } from '../../../bot/domain/usecases/NewBot';
import { ILaunchBrowser } from '../../../browser/domain/usecases/LaunchBrowser';
import BotController from '../../../bot/presentation/controllers/BotController';

export const SCRAPER_LAUNCH_BROWSER_WARNING_MESSAGE = "Failed on [LaunchBrowser] call from [ScraperRepository].";
export const SCRAPER_NEW_BOT_WARNING_MESSAGE = "Failed on [NewBot] call made from [ScraperRepository].";
export const SCRAPER_BOT_CONTROLLER_INITIALIZE_WARNING_MESSAGE = "Failed on [BotController.initialize] call made from [ScraperRepository].";
export const SCRAPER_BOT_LOGIN_TO_PARTS_CHECK_FAILURE_MESSAGE = "Failed on [BotRepository.loginToPartsCheck].";

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

  async scrapePartNumber(url: ScrapePartNumberParams): Promise<Either<Failure, boolean>> {
    this.logger.info("[ScraperRepository.scrapePartNumber] started.");

    const botOrFailure = await this.launchBotController();

    if (botOrFailure.isLeft()) {
      return new Left(botOrFailure.value);
    }

    const bot = botOrFailure.value;

    const page = bot.pages[0];

    const loggedInOrFailed = await this.loginToPartsCheck(page);

    if (loggedInOrFailed.isLeft()) {
      this.logger.info("[ScraperRepository.scrapePartNumber] completed with a [Failure].");
      this.logger.warn(SCRAPER_BOT_CONTROLLER_INITIALIZE_WARNING_MESSAGE);

      await bot.stealthBrowser.context.close();
      await bot.stealthBrowser.browser.close();

      return new Left(loggedInOrFailed.value);
    }

    this.logger.info("[ScraperRepository.scrapePartNumber] completed.");

    await page.goto(url);

    return new Left(new Failure(""));
  }

  loginToPartsCheck(page: Page): Promise<Either<Failure, boolean>> {
    throw new Error("Method not implemented.");
  }
}

export default ScraperRepositoryImpl;
