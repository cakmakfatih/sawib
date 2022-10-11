import { Either } from '@typed-f/either';
import BotController from '../../../bot/presentation/controllers/BotController';
import { Failure } from '../../../../core/error/failures';
import { ScrapePartNumberParams } from '../usecases/ScrapePartNumber';

interface ScraperRepository {
  scrapePartNumber(params: ScrapePartNumberParams): Promise<Either<Failure, boolean>>;
  loginToPartsCheck(controller: BotController): Promise<Either<Failure, boolean>>;
}

export default ScraperRepository;
