import { Either } from "@typed-f/either";
import { Failure } from "../../../../core/error/failures";
import ScraperRepository from "../repositories/ScraperRepository";

type GetPartNumbersParams = string;

interface IGetPartNumbers {
  (params: GetPartNumbersParams): Promise<Either<Failure, string[]>>;
}

async function GetPartNumbers(repository: ScraperRepository, params: GetPartNumbersParams): Promise<Either<Failure, string[]>> {
  return await repository.getPartNumbers(params);
}

export {
  GetPartNumbersParams,
  IGetPartNumbers,
  GetPartNumbers,
};
