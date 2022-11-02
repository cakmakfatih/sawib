import { stubInterface } from 'ts-sinon';
import { equal, ok } from 'assert';
import { Either, Right } from '@typed-f/either';
import { IGetVehicleInfo, GetVehicleInfo, GetVehicleInfoParams } from '../../../../../../main/features/scraper/domain/usecases/GetVehicleInfo';
import { Failure } from '../../../../../../main/core/error/failures';
import BotController from '../../../../../../main/features/bot/presentation/controllers/BotController';
import ScraperRepository from '../../../../../../main/features/scraper/domain/repositories/ScraperRepository';
import VehicleInfo from '../../../../../../main/features/scraper/domain/entities/VehicleInfo';

const mockRepository = stubInterface<ScraperRepository>();

const mockBotController: BotController = stubInterface<BotController>();
const usecase: IGetVehicleInfo = (params: GetVehicleInfoParams) => GetVehicleInfo(mockRepository, params);

describe("GetVehicleInfo", () => {
  it("should call [ScraperRepository.getVehicleInfo] once with correct params", async () => {
    // arrange
    const params: GetVehicleInfoParams = mockBotController;

    // act
    await usecase(params);

    // assert
    ok(mockRepository.getVehicleInfo.calledOnceWith(params));
  });

  it("should return the value retrieved from [ScraperRepository.getVehicleInfo]", async () => {
    // arrange
    const params: GetVehicleInfoParams = mockBotController;

    const repositoryResult: Either<Failure, VehicleInfo> = new Right(stubInterface<VehicleInfo>());
    mockRepository.getVehicleInfo.resolves(repositoryResult);

    // act
    const result = await usecase(params);

    // assert
    equal(result, repositoryResult);
  });
});
