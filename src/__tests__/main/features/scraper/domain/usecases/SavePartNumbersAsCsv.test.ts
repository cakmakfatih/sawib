import { stubInterface } from 'ts-sinon';
import { equal, ok } from 'assert';
import { Either, Right } from '@typed-f/either';
import { ISavePartNumbersAsCsv, SavePartNumbersAsCsv, SavePartNumbersAsCsvParams } from '../../../../../../main/features/scraper/domain/usecases/SavePartNumbersAsCsv';
import { Failure } from '../../../../../../main/core/error/failures';
import ScraperRepository from '../../../../../../main/features/scraper/domain/repositories/ScraperRepository';

const mockRepository = stubInterface<ScraperRepository>();

const usecase: ISavePartNumbersAsCsv = (params: SavePartNumbersAsCsvParams) => SavePartNumbersAsCsv(mockRepository, params);

describe("SavePartNumbersAsCsv", () => {
  it("should call [ScraperRepository.savePartNumbersAsCsv] once with correct params", () => {
    // arrange
    const params: SavePartNumbersAsCsvParams = ["test-url"];

    // act
    usecase(params);

    // assert
    ok(mockRepository.savePartNumbersAsCsv.calledOnceWith(params));
  });

  it("should return the value retrieved from [ScraperRepository.savePartNumbersAsCsv]", () => {
    // arrange
    const params: SavePartNumbersAsCsvParams = ["test-url"];

    const repositoryResult: Either<Failure, boolean> = new Right(true);
    mockRepository.savePartNumbersAsCsv.returns(repositoryResult);

    // act
    const result = usecase(params);

    // assert
    equal(result, repositoryResult);
  });
});
