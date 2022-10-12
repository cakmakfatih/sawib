import { Either } from "@typed-f/either";
import { Failure } from "../../../../core/error/failures";
import ScraperRepository from "../repositories/ScraperRepository";

type SavePartNumbersAsCsvParams = string[];

interface ISavePartNumbersAsCsv {
  (params: SavePartNumbersAsCsvParams): Promise<Either<Failure, boolean>>;
}

async function SavePartNumbersAsCsv(repository: ScraperRepository, params: SavePartNumbersAsCsvParams): Promise<Either<Failure, boolean>> {
  return await repository.savePartNumbersAsCsv(params);
}

export {
  SavePartNumbersAsCsvParams,
  ISavePartNumbersAsCsv,
  SavePartNumbersAsCsv,
};
