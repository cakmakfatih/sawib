import { Either } from "@typed-f/either";
import { Failure } from "../../../../core/error/failures";
import BotController from "../../../../features/bot/presentation/controllers/BotController";
import VehicleInfo from "../entities/VehicleInfo";
import ScraperRepository from "../repositories/ScraperRepository";

type GetVehicleInfosParams = BotController;

interface IGetVehicleInfos {
  (params: GetVehicleInfosParams): Promise<Either<Failure, VehicleInfo[]>>;
}

async function GetVehicleInfos(repository: ScraperRepository, params: GetVehicleInfosParams): Promise<Either<Failure, VehicleInfo[]>> {
  return await repository.getVehicleInfos(params);
}

export {
  GetVehicleInfosParams,
  IGetVehicleInfos,
  GetVehicleInfos,
};
