import { Either } from '@typed-f/either';
import { Failure } from '../../../../core/error/failures';
import { LoginToPartsCheckParams } from '../usecases/LoginToPartsCheck';

interface ScraperRepository {
  scrapePartNumber(url: string): Promise<Either<Failure, boolean>>;
  loginToPartsCheck(params: LoginToPartsCheckParams): Promise<Either<Failure, boolean>>;
  savePartNumbersAsCsv(partNumbersArray: string[]): Promise<Either<Failure, boolean>>;
}

export default ScraperRepository;
