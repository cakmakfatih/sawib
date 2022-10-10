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
import { CONCURRENCY } from '../../../../features/browser/bin/config';

export const CREATE_PAGES_FAILURE_MESSAGE = "Failed while creating pages.";

@injectable()
class BotRepositoryImpl implements BotRepository {
  private readonly logger: Logger;
  private readonly newPage: INewPage;

  constructor(
    @inject(Tokens.logger) logger: Logger,
    @inject(Tokens.newPage) newPage: INewPage,
  ) {
    this.logger = logger;
    this.newPage = newPage;
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

        return new Left(new BotFailure(CREATE_PAGES_FAILURE_MESSAGE, failure.error));
      }

      pages.push(pageOrFailure.value);
    }

    this.logger.info("[BotRepository.createPages] completed.");

    return new Right(pages);
  }
}

export default BotRepositoryImpl;
