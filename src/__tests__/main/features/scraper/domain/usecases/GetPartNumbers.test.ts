import { stubInterface } from 'ts-sinon';
import { equal, ok } from 'assert';
import { Either, Right } from '@typed-f/either';
import { IGetPartNumbers, GetPartNumbers, GetPartNumbersParams } from '../../../../../../main/features/scraper/domain/usecases/GetPartNumbers';
import { Failure } from '../../../../../../main/core/error/failures';
import ScraperRepository from '../../../../../../main/features/scraper/domain/repositories/ScraperRepository';

const mockRepository = stubInterface<ScraperRepository>();

const usecase: IGetPartNumbers = (params: GetPartNumbersParams) => GetPartNumbers(mockRepository, params);

describe("GetPartNumbers", () => {
  it("should call [ScraperRepository.getPartNumbers] once with correct params", async () => {
    // arrange
    const params: GetPartNumbersParams = stubInterface<GetPartNumbersParams>();

    // act
    await usecase(params);

    // assert
    ok(mockRepository.getPartNumbers.calledOnceWith(params));
  });

  it("should return the value retrieved from [ScraperRepository.getPartNumbers]", async () => {
    // arrange
    const params: GetPartNumbersParams = stubInterface<GetPartNumbersParams>();
    const repositoryResult: Either<Failure, string[]> = new Right(["pn1", "pn2"]);
    mockRepository.getPartNumbers.resolves(repositoryResult);

    // act
    const result = await usecase(params);

    // assert
    equal(result, repositoryResult);
  });
});
