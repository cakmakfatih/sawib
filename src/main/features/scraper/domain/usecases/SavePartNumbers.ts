import { Either } from '@typed-f/either';
import { Failure } from '../../../../core/error/failures';
import ScraperRepository from '../repositories/ScraperRepository';

type SavePartNumbersParams = string[];

interface ISavePartNumbers {
  (params: SavePartNumbersParams): Promise<Either<Failure, boolean>>;
}

async function SavePartNumbers(repository: ScraperRepository, params: SavePartNumbersParams): Promise<Either<Failure, boolean>> {
  return await repository.savePartNumbers(params);
}

export {
  SavePartNumbersParams,
  ISavePartNumbers,
  SavePartNumbers,
};
