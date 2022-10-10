import { Either } from '@typed-f/either';
import { BrowserContext, Page } from 'playwright-firefox';
import BotRepository from '../../domain/repositories/BotRepository';
import BotController from '../../presentation/controllers/BotController';
import { inject, injectable } from 'tsyringe';
import Tokens from '../../../../bin/Tokens';
import Logger from '../../../../core/Logger';
import { Failure } from '../../../../core/error/failures';
import { INewPage } from '../../../../features/browser/domain/usecases/NewPage';
import StealthBrowser from '../../../../features/browser/domain/entities/StealthBrowser';

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

  newBot(stealthBrowser: StealthBrowser): Promise<Either<Failure, BotController>> {
    throw new Error("Method not implemented.");
  }

  createPages(context: BrowserContext): Promise<Either<Failure, Page[]>> {
    throw new Error("Method not implemented.");
  }
}

export default BotRepositoryImpl;
