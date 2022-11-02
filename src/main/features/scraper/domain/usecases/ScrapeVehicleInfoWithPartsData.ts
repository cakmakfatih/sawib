import { Either } from '@typed-f/either';
import { Failure } from '../../../../core/error/failures';
import ScraperRepository from '../repositories/ScraperRepository';

type ScrapeVehicleInfoWithPartsDataParams = string;

interface IScrapeVehicleInfoWithPartsData {
  (params: ScrapeVehicleInfoWithPartsDataParams): Promise<Either<Failure, boolean>>;
}

async function ScrapeVehicleInfoWithPartsData(repository: ScraperRepository, params: ScrapeVehicleInfoWithPartsDataParams): Promise<Either<Failure, boolean>> {
  return await repository.scrapeVehicleInfoWithPartsData(params);
}

export {
  ScrapeVehicleInfoWithPartsDataParams,
  IScrapeVehicleInfoWithPartsData,
  ScrapeVehicleInfoWithPartsData,
};
