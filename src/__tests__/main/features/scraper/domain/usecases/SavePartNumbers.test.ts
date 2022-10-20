import { stubInterface } from 'ts-sinon';
import { equal, ok } from 'assert';
import { Either, Right } from '@typed-f/either';
import { ISavePartNumbers, SavePartNumbers, SavePartNumbersParams } from '../../../../../../main/features/scraper/domain/usecases/SavePartNumbers';
import { Failure } from '../../../../../../main/core/error/failures';
import ScraperRepository from '../../../../../../main/features/scraper/domain/repositories/ScraperRepository';

const mockRepository = stubInterface<ScraperRepository>();

const usecase: ISavePartNumbers = (params: SavePartNumbersParams) => SavePartNumbers(mockRepository, params);

describe("SavePartNumbers", () => {
  it("should call [ScraperRepository.savePartNumbers] once with correct params", async () => {
    // arrange
    const params = ["pn1", "pn2"];

    // act
    await usecase(params);

    // assert
    ok(mockRepository.savePartNumbers.calledOnceWith(params));
  });

  it("should return the value retrieved from [ScraperRepository.savePartNumbers]", async () => {
    // arrange
    const params = ["pn1", "pn2"];
    const repositoryResult: Either<Failure, boolean> = new Right(true);
    mockRepository.savePartNumbers.resolves(repositoryResult);

    // act
    const result = await usecase(params);

    // assert
    equal(result, repositoryResult);
  });
});
