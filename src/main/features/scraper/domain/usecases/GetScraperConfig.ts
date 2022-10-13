import { Either } from "@typed-f/either";
import { Failure } from "../../../../core/error/failures";
import ScraperConfig from "../entities/ScraperConfig";
import ScraperRepository from "../repositories/ScraperRepository";

interface IGetScraperConfig {
  (): Either<Failure, ScraperConfig | null>;
}

function GetScraperConfig(repository: ScraperRepository): Either<Failure, ScraperConfig | null> {
  return repository.getScraperConfig();
}

export {
  IGetScraperConfig,
  GetScraperConfig,
};
