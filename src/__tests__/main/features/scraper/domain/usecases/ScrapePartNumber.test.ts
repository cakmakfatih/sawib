import { stubInterface } from 'ts-sinon';
import { equal, ok } from 'assert';
import { Either, Right } from '@typed-f/either';
import { IScrapePartNumber, ScrapePartNumber, ScrapePartNumberParams } from '../../../../../../main/features/scraper/domain/usecases/ScrapePartNumber';
import { Failure } from '../../../../../../main/core/error/failures';
import ScraperRepository from '../../../../../../main/features/scraper/domain/repositories/ScraperRepository';

const mockRepository = stubInterface<ScraperRepository>();

const usecase: IScrapePartNumber = (params: ScrapePartNumberParams) => ScrapePartNumber(mockRepository, params);

describe("ScrapePartNumber", () => {
  it("should call [ScraperRepository.scrapePartNumber] once with correct params", async () => {
    // arrange
    const params: ScrapePartNumberParams = "12356";

    // act
    await usecase(params);

    // assert
    ok(mockRepository.scrapePartNumber.calledOnceWith(params));
  });

  it("should return the value retrieved from [ScraperRepository.scrapePartNumber]", async () => {
    // arrange
    const params: ScrapePartNumberParams = "12356";

    const repositoryResult: Either<Failure, boolean> = new Right(true);
    mockRepository.scrapePartNumber.resolves(repositoryResult);

    // act
    const result = await usecase(params);

    // assert
    equal(result, repositoryResult);
  });
});
