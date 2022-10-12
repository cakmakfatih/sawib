import { Either } from "@typed-f/either";
import { Failure } from "../../../../core/error/failures";
import ScraperConfig from "../entities/ScraperConfig";
import ScraperRepository from "../repositories/ScraperRepository";

type SetScraperConfigParams = ScraperConfig;

interface ISetScraperConfig {
  (params: SetScraperConfigParams): Either<Failure, boolean>;
}

function SetScraperConfig(repository: ScraperRepository, params: SetScraperConfigParams): Either<Failure, boolean> {
  return repository.setScraperConfig(params);
}

export {
  SetScraperConfigParams,
  ISetScraperConfig,
  SetScraperConfig,
};
