import { stubInterface } from 'ts-sinon';
import { equal, ok } from 'assert';
import { Either, Right } from '@typed-f/either';
import { IScrapePartNumbers, ScrapePartNumbers, ScrapePartNumbersParams } from '../../../../../../main/features/scraper/domain/usecases/ScrapePartNumbers';
import { Failure } from '../../../../../../main/core/error/failures';
import ScraperRepository from '../../../../../../main/features/scraper/domain/repositories/ScraperRepository';

const mockRepository = stubInterface<ScraperRepository>();

const usecase: IScrapePartNumbers = (params: ScrapePartNumbersParams) => ScrapePartNumbers(mockRepository, params);

describe("ScrapePartNumbers", () => {
  it("should call [ScraperRepository.scrapePartNumbers] once with correct params", async () => {
    // arrange
    const params: ScrapePartNumbersParams = "test-url";

    // act
    await usecase(params);

    // assert
    ok(mockRepository.scrapePartNumbers.calledOnceWith(params));
  });

  it("should return the value retrieved from [ScraperRepository.scrapePartNumbers]", async () => {
    // arrange
    const params: ScrapePartNumbersParams = "test-url";

    const repositoryResult: Either<Failure, boolean> = new Right(true);
    mockRepository.scrapePartNumbers.resolves(repositoryResult);

    // act
    const result = await usecase(params);

    // assert
    equal(result, repositoryResult);
  });
});
