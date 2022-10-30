import { Either } from "@typed-f/either";
import { Failure } from "../../../../core/error/failures";
import ScraperRepository from "../repositories/ScraperRepository";
import VehicleInfo from "../entities/VehicleInfo";

type SaveVehicleInfoWithPartsDataAsCsvParams = {
  partNumbersAndTexts: {}[];
  vehicleInfo: VehicleInfo;
};

interface ISaveVehicleInfoWithPartsDataAsCsv {
  (params: SaveVehicleInfoWithPartsDataAsCsvParams): Either<Failure, boolean>;
}

function SaveVehicleInfoWithPartsDataAsCsv(repository: ScraperRepository, params: SaveVehicleInfoWithPartsDataAsCsvParams): Either<Failure, boolean> {
  return repository.saveVehicleInfoWithPartsDataAsCsv(params);
}

export {
  SaveVehicleInfoWithPartsDataAsCsvParams,
  ISaveVehicleInfoWithPartsDataAsCsv,
  SaveVehicleInfoWithPartsDataAsCsv,
};
