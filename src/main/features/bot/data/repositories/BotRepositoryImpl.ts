import { Either, Left, Right } from '@typed-f/either';
import { BrowserContext, Page } from 'playwright-firefox';
import BotRepository from '../../domain/repositories/BotRepository';
import BotController from '../../presentation/controllers/BotController';
import { inject, injectable } from 'tsyringe';
import Tokens from '../../../../bin/Tokens';
import Logger from '../../../../core/Logger';
import { BotFailure, BrowserFailure, Failure } from '../../../../core/error/failures';
import { INewPage } from '../../../../features/browser/domain/usecases/NewPage';
import StealthBrowser from '../../../../features/browser/domain/entities/StealthBrowser';
import { CONCURRENCY } from '../../../../bin/config';
import sinon from 'sinon';
import { ILaunchBrowser } from 'main/features/browser/domain/usecases/LaunchBrowser';

export const CREATE_PAGES_FAILURE_MESSAGE = "Failed while creating pages.";
export const LAUNCH_BROWSER_WARNING_MESSAGE = "Failed on [LaunchBrowser] call from [BotRepository].";
export const NEW_BOT_WARNING_MESSAGE = "Failed on [NewBot] call made from [BotRepository].";
export const BOT_CONTROLLER_INITIALIZE_WARNING_MESSAGE = "Failed on [BotController.initialize] call made from [BotRepository].";

sinon.stub(BotController);

@injectable()
class BotRepositoryImpl implements BotRepository {
  private readonly logger: Logger;
  private readonly newPage: INewPage;
  private readonly launchBrowser: ILaunchBrowser;

  constructor(
    @inject(Tokens.logger) logger: Logger,
    @inject(Tokens.newPage) newPage: INewPage,
    @inject(Tokens.launchBrowser) launchBrowser: ILaunchBrowser,
  ) {
    this.logger = logger;
    this.newPage = newPage;
    this.launchBrowser = launchBrowser;
  }

  async newBot(stealthBrowser: StealthBrowser): Promise<Either<Failure, BotController>> {
    this.logger.info("[BotRepository.newBot] started.");

    const botController = new BotController(stealthBrowser);

    this.logger.info("[BotRepository.newBot] completed.");

    return new Right(botController);
  }

  async createPages(context: BrowserContext): Promise<Either<Failure, Page[]>> {
    this.logger.info("[BotRepository.createPages] started.");

    const pages: Page[] = [];

    for (let i = 0; i < CONCURRENCY; i++) {
      const pageOrFailure = await this.newPage(context);

      if (pageOrFailure.isLeft()) {
        const failure: BrowserFailure = pageOrFailure.value;

        this.logger.warn(CREATE_PAGES_FAILURE_MESSAGE);
        this.logger.error(failure.error!);

        pages.forEach(async (page) => {
          await page.close();
        });

        this.logger.info("[BotRepository.createPages] completed with a [Failure].");

        return new Left(new BotFailure(CREATE_PAGES_FAILURE_MESSAGE, failure.error));
      }

      pages.push(pageOrFailure.value);
    }

    this.logger.info("[BotRepository.createPages] completed.");

    return new Right(pages);
  }

  async launchBotController(): Promise<Either<Failure, BotController>> {
    this.logger.info("[BotRepository.launchBotController] started.");

    const stealthBrowserOrFailure = await this.launchBrowser();

    if (stealthBrowserOrFailure.isLeft()) {
      this.logger.info("[BotRepository.launchBotController] completed with a [Failure].");
      this.logger.warn(LAUNCH_BROWSER_WARNING_MESSAGE);

      return new Left(stealthBrowserOrFailure.value);
    }

    const stealthBrowser = stealthBrowserOrFailure.value;

    const botControllerOrFailure = await this.newBot(stealthBrowser);

    if (botControllerOrFailure.isLeft()) {
      this.logger.info("[BotRepository.launchBotController] completed with a [Failure].");
      this.logger.warn(NEW_BOT_WARNING_MESSAGE);

      await stealthBrowser.context.close();
      await stealthBrowser.browser.close();

      return new Left(botControllerOrFailure.value);
    }

    const botController = botControllerOrFailure.value;

    const initializedOrFailed = await botController.initialize();

    if (initializedOrFailed.isLeft()) {
      this.logger.info("[BotRepository.launchBotController] completed with a [Failure].");
      this.logger.warn(BOT_CONTROLLER_INITIALIZE_WARNING_MESSAGE);

      await stealthBrowser.context.close();
      await stealthBrowser.browser.close();

      return new Left(initializedOrFailed.value);
    }

    this.logger.info("[BotRepository.launchBotController] completed.");

    return new Right(botController);
  }
}

export default BotRepositoryImpl;
