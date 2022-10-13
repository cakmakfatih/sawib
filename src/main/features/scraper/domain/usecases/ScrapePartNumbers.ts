import { Either } from '@typed-f/either';
import { Failure } from '../../../../core/error/failures';
import ScraperRepository from '../repositories/ScraperRepository';

type ScrapePartNumbersParams = string;

interface IScrapePartNumbers {
  (params: ScrapePartNumbersParams): Promise<Either<Failure, boolean>>;
}

async function ScrapePartNumbers(repository: ScraperRepository, params: ScrapePartNumbersParams): Promise<Either<Failure, boolean>> {
  return await repository.scrapePartNumbers(params);
}

export {
  ScrapePartNumbersParams,
  IScrapePartNumbers,
  ScrapePartNumbers,
};
