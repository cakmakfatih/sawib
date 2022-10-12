import { Either } from '@typed-f/either';
import { Failure } from '../../../../core/error/failures';
import { ScrapePartNumberParams } from '../usecases/ScrapePartNumber';
import { LoginToPartsCheckParams } from '../usecases/LoginToPartsCheck';

interface ScraperRepository {
  scrapePartNumber(url: ScrapePartNumberParams): Promise<Either<Failure, boolean>>;
  loginToPartsCheck(params: LoginToPartsCheckParams): Promise<Either<Failure, boolean>>;
}

export default ScraperRepository;
