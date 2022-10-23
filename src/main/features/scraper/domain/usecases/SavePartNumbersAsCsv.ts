import { Either } from '@typed-f/either';
import { Failure } from '../../../../core/error/failures';
import ScraperRepository from '../repositories/ScraperRepository';

type SavePartNumbersAsCsvParams = string[];

interface ISavePartNumbersAsCsv {
  (params: SavePartNumbersAsCsvParams): Either<Failure, boolean>;
}

function SavePartNumbersAsCsv(repository: ScraperRepository, params: SavePartNumbersAsCsvParams): Either<Failure, boolean> {
  return repository.savePartNumbersAsCsv(params);
}

export {
  SavePartNumbersAsCsvParams,
  ISavePartNumbersAsCsv,
  SavePartNumbersAsCsv,
};
