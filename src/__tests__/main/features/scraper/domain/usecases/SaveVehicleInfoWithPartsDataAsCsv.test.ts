import { stubInterface } from 'ts-sinon';
import { equal, ok } from 'assert';
import { Either, Right } from '@typed-f/either';
import { ISaveVehicleInfoWithPartsDataAsCsv, SaveVehicleInfoWithPartsDataAsCsv, SaveVehicleInfoWithPartsDataAsCsvParams } from '../../../../../../main/features/scraper/domain/usecases/SaveVehicleInfoWithPartsDataAsCsv';
import { Failure } from '../../../../../../main/core/error/failures';
import ScraperRepository from '../../../../../../main/features/scraper/domain/repositories/ScraperRepository';
import VehicleInfo from 'main/features/scraper/domain/entities/VehicleInfo';

const mockRepository = stubInterface<ScraperRepository>();

const usecase: ISaveVehicleInfoWithPartsDataAsCsv = (params: SaveVehicleInfoWithPartsDataAsCsvParams) => SaveVehicleInfoWithPartsDataAsCsv(mockRepository, params);

describe("SaveVehicleInfoWithPartsDataAsCsv", () => {
  it("should call [ScraperRepository.saveVehicleInfoWithPartsDataAsCsv] once with correct params", () => {
    // arrange
    const params: SaveVehicleInfoWithPartsDataAsCsvParams = { partNumbersAndTexts: [], vehicleInfo: stubInterface<VehicleInfo>() };

    // act
    usecase(params);

    // assert
    ok(mockRepository.saveVehicleInfoWithPartsDataAsCsv.calledOnceWith(params));
  });

  it("should return the value retrieved from [ScraperRepository.saveVehicleInfoWithPartsDataAsCsv]", () => {
    // arrange
    const params: SaveVehicleInfoWithPartsDataAsCsvParams = { partNumbersAndTexts: [], vehicleInfo: stubInterface<VehicleInfo>() };

    const repositoryResult: Either<Failure, boolean> = new Right(true);
    mockRepository.saveVehicleInfoWithPartsDataAsCsv.returns(repositoryResult);

    // act
    const result = usecase(params);

    // assert
    equal(result, repositoryResult);
  });
});
