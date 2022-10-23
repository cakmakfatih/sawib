import { stubInterface } from 'ts-sinon';
import { equal, ok } from 'assert';
import { Either, Right } from '@typed-f/either';
import { IGetVehicleInfos, GetVehicleInfos, GetVehicleInfosParams } from '../../../../../../main/features/scraper/domain/usecases/GetVehicleInfos';
import { Failure } from '../../../../../../main/core/error/failures';
import BotController from '../../../../../../main/features/bot/presentation/controllers/BotController';
import ScraperRepository from '../../../../../../main/features/scraper/domain/repositories/ScraperRepository';
import VehicleInfo from '../../../../../../main/features/scraper/domain/entities/VehicleInfo';

const mockRepository = stubInterface<ScraperRepository>();

const mockBotController: BotController = stubInterface<BotController>();
const usecase: IGetVehicleInfos = (params: GetVehicleInfosParams) => GetVehicleInfos(mockRepository, params);

describe("GetVehicleInfos", () => {
  it("should call [ScraperRepository.getVehicleInfos] once with correct params", async () => {
    // arrange
    const params: GetVehicleInfosParams = mockBotController;

    // act
    await usecase(params);

    // assert
    ok(mockRepository.getVehicleInfos.calledOnceWith(params));
  });

  it("should return the value retrieved from [ScraperRepository.getVehicleInfos]", async () => {
    // arrange
    const params: GetVehicleInfosParams = mockBotController;

    const repositoryResult: Either<Failure, VehicleInfo[]> = new Right([]);
    mockRepository.getVehicleInfos.resolves(repositoryResult);

    // act
    const result = await usecase(params);

    // assert
    equal(result, repositoryResult);
  });
});
