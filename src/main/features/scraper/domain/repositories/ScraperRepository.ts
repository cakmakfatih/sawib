import { Either } from '@typed-f/either';
import { Failure } from '../../../../core/error/failures';
import ScraperConfig from '../entities/ScraperConfig';
import { LoginToPartsCheckParams } from '../usecases/LoginToPartsCheck';

interface ScraperRepository {
  scrapePartNumber(url: string): Promise<Either<Failure, boolean>>;
  loginToPartsCheck(params: LoginToPartsCheckParams): Promise<Either<Failure, boolean>>;
  savePartNumbersAsCsv(partNumbersArray: string[]): Either<Failure, boolean>;
  setScraperConfig(config: ScraperConfig): Either<Failure, boolean>;
  getScraperConfig(): Either<Failure, ScraperConfig>;
}

export default ScraperRepository;
