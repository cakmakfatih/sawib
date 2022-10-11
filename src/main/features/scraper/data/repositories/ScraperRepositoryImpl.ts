import { Either, Left } from '@typed-f/either';
import { Failure } from '../../../../core/error/failures';
import BotController from '../../../bot/presentation/controllers/BotController';
import ScraperRepository from '../../domain/repositories/ScraperRepository';
import { ScrapePartNumberParams } from '../../domain/usecases/ScrapePartNumber';
import { inject, injectable } from 'tsyringe';
import Tokens from '../../../../bin/Tokens';
import Logger from '../../../../core/Logger';
import { ScraperLocalDataSource } from '../datasources/ScraperLocalDataSource';
import { INewBot } from '../../../bot/domain/usecases/NewBot';
import { ICreatePages } from '../../../bot/domain/usecases/CreatePages';
import { ILaunchBrowser } from '../../../browser/domain/usecases/LaunchBrowser';

export const SCRAPER_LAUNCH_BROWSER_FAILURE_MESSAGE = "Failed while launching the browser from [ScraperRepository].";

@injectable()
class ScraperRepositoryImpl implements ScraperRepository {
  private readonly logger: Logger;
  private readonly localDataSource: ScraperLocalDataSource;
  private readonly launchBrowser: ILaunchBrowser;
  private readonly newBot: INewBot;
  private readonly createPages: ICreatePages;

  constructor(
    @inject(Tokens.logger) logger: Logger,
    @inject(Tokens.scraperLocalDataSource) localDataSource: ScraperLocalDataSource,
    @inject(Tokens.launchBrowser) launchBrowser: ILaunchBrowser,
    @inject(Tokens.newBot) newBot: INewBot,
    @inject(Tokens.createPages) createPages: ICreatePages,
  ) {
    this.logger = logger;
    this.localDataSource = localDataSource;
    this.launchBrowser = launchBrowser;
    this.newBot = newBot;
    this.createPages = createPages;
  }

  async scrapePartNumber(params: ScrapePartNumberParams): Promise<Either<Failure, boolean>> {
    this.logger.info("[ScraperRepository.scrapePartNumber] started.");

    const browserOrFailure = await this.launchBrowser();

    if (browserOrFailure.isLeft()) {
      this.logger.info("[ScraperRepository.scrapePartNumber] completed with a [Failure].");
      this.logger.warn(SCRAPER_LAUNCH_BROWSER_FAILURE_MESSAGE);

      return new Left(browserOrFailure.value);
    }

    this.logger.info("[ScraperRepository.scrapePartNumber] completed.");

    return new Left(new Failure(""));
  }

  loginToPartsCheck(controller: BotController): Promise<Either<Failure, boolean>> {
    throw new Error("Method not implemented.");
  }
}

export default ScraperRepositoryImpl;
