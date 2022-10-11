import { Either } from '@typed-f/either';
import { Failure } from '../../../../core/error/failures';
import BotController from '../../../bot/presentation/controllers/BotController';
import ScraperRepository from '../../domain/repositories/ScraperRepository';
import { ScrapePartNumberParams } from '../../domain/usecases/ScrapePartNumber';
import { inject, injectable } from 'tsyringe';
import Tokens from '../../../../bin/Tokens';
import Logger from '../../../../core/Logger';

@injectable()
class ScraperRepositoryImpl implements ScraperRepository {
  private readonly logger: Logger;

  constructor(
    @inject(Tokens.logger) logger: Logger,
  ) {
    this.logger = logger;
  }

  scrapePartNumber(params: ScrapePartNumberParams): Promise<Either<Failure, boolean>> {
    throw new Error("Method not implemented.");
  }

  loginToPartsCheck(controller: BotController): Promise<Either<Failure, boolean>> {
    throw new Error("Method not implemented.");
  }
}

export default ScraperRepositoryImpl;
