import { stubInterface } from 'ts-sinon';
import { equal, ok } from 'assert';
import { Either, Right } from '@typed-f/either';
import { IScrapeVehicleInfoWithPartsData, ScrapeVehicleInfoWithPartsData, ScrapeVehicleInfoWithPartsDataParams } from '../../../../../../main/features/scraper/domain/usecases/ScrapeVehicleInfoWithPartsData';
import { Failure } from '../../../../../../main/core/error/failures';
import ScraperRepository from '../../../../../../main/features/scraper/domain/repositories/ScraperRepository';

const mockRepository = stubInterface<ScraperRepository>();

const usecase: IScrapeVehicleInfoWithPartsData = (params: ScrapeVehicleInfoWithPartsDataParams) => ScrapeVehicleInfoWithPartsData(mockRepository, params);

describe("ScrapeVehicleInfoWithPartsData", () => {
  it("should call [ScraperRepository.scrapeVehicleInfoWithPartsData] once with correct params", async () => {
    // arrange
    const params: ScrapeVehicleInfoWithPartsDataParams = "test-url";

    // act
    await usecase(params);

    // assert
    ok(mockRepository.scrapeVehicleInfoWithPartsData.calledOnceWith(params));
  });

  it("should return the value retrieved from [ScraperRepository.scrapeVehicleInfoWithPartsData]", async () => {
    // arrange
    const params: ScrapeVehicleInfoWithPartsDataParams = "test-url";

    const repositoryResult: Either<Failure, boolean> = new Right(true);
    mockRepository.scrapeVehicleInfoWithPartsData.resolves(repositoryResult);

    // act
    const result = await usecase(params);

    // assert
    equal(result, repositoryResult);
  });
});
