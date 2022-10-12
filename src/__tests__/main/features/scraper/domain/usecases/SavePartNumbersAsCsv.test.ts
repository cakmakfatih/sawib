import { stubInterface } from 'ts-sinon';
import { equal, ok } from 'assert';
import { Either, Right } from '@typed-f/either';
import { ISavePartNumbersAsCsv, SavePartNumbersAsCsv, SavePartNumbersAsCsvParams } from '../../../../../../main/features/scraper/domain/usecases/SavePartNumbersAsCsv';
import { Failure } from '../../../../../../main/core/error/failures';
import ScraperRepository from '../../../../../../main/features/scraper/domain/repositories/ScraperRepository';

const mockRepository = stubInterface<ScraperRepository>();

const usecase: ISavePartNumbersAsCsv = (params: SavePartNumbersAsCsvParams) => SavePartNumbersAsCsv(mockRepository, params);

describe("SavePartNumbersAsCsv", () => {
  it("should call [ScraperRepository.savePartNumbersAsCsv] once with correct params", async () => {
    // arrange
    const params: SavePartNumbersAsCsvParams = ["test-url"];

    // act
    await usecase(params);

    // assert
    ok(mockRepository.savePartNumbersAsCsv.calledOnceWith(params));
  });

  it("should return the value retrieved from [ScraperRepository.savePartNumbersAsCsv]", async () => {
    // arrange
    const params: SavePartNumbersAsCsvParams = ["test-url"];

    const repositoryResult: Either<Failure, boolean> = new Right(true);
    mockRepository.savePartNumbersAsCsv.resolves(repositoryResult);

    // act
    const result = await usecase(params);

    // assert
    equal(result, repositoryResult);
  });
});
