import { Either } from '@typed-f/either';
import { Failure } from '../../../../core/error/failures';
import ScraperRepository from '../repositories/ScraperRepository';

type ScrapePartNumberParams = string;

interface IScrapePartNumber {
  (params: ScrapePartNumberParams): Promise<Either<Failure, boolean>>;
}

async function ScrapePartNumber(repository: ScraperRepository, params: ScrapePartNumberParams): Promise<Either<Failure, boolean>> {
  return await repository.scrapePartNumber(params);
}

export {
  ScrapePartNumberParams,
  IScrapePartNumber,
  ScrapePartNumber,
};
