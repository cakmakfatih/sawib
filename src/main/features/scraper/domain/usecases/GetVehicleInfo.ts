import { Either } from "@typed-f/either";
import { Failure } from "../../../../core/error/failures";
import BotController from "../../../bot/presentation/controllers/BotController";
import VehicleInfo from "../entities/VehicleInfo";
import ScraperRepository from "../repositories/ScraperRepository";

type GetVehicleInfoParams = BotController;

interface IGetVehicleInfo {
  (params: GetVehicleInfoParams): Promise<Either<Failure, VehicleInfo>>;
}

async function GetVehicleInfo(repository: ScraperRepository, params: GetVehicleInfoParams): Promise<Either<Failure, VehicleInfo>> {
  return await repository.getVehicleInfo(params);
}

export {
  GetVehicleInfoParams,
  IGetVehicleInfo,
  GetVehicleInfo,
};
