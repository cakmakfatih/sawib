import { stubInterface } from 'ts-sinon';
import { equal, ok } from 'assert';
import { Either, Right } from '@typed-f/either';
import { IGetPartNumbersAndPartTexts, GetPartNumbersAndPartTexts, GetPartNumbersAndPartTextsParams } from '../../../../../../main/features/scraper/domain/usecases/GetPartNumbersAndPartTexts';
import { Failure } from '../../../../../../main/core/error/failures';
import ScraperRepository from '../../../../../../main/features/scraper/domain/repositories/ScraperRepository';

const mockRepository = stubInterface<ScraperRepository>();

const usecase: IGetPartNumbersAndPartTexts = (params: GetPartNumbersAndPartTextsParams) => GetPartNumbersAndPartTexts(mockRepository, params);

describe("GetPartNumbersAndPartTexts", () => {
  it("should call [ScraperRepository.getPartNumbersAndPartTexts] once with correct params", async () => {
    // arrange
    const params: GetPartNumbersAndPartTextsParams = stubInterface<GetPartNumbersAndPartTextsParams>();

    // act
    await usecase(params);

    // assert
    ok(mockRepository.getPartNumbersAndPartTexts.calledOnceWith(params));
  });

  it("should return the value retrieved from [ScraperRepository.getPartNumbersAndPartTexts]", async () => {
    // arrange
    const params: GetPartNumbersAndPartTextsParams = stubInterface<GetPartNumbersAndPartTextsParams>();
    const repositoryResult: Either<Failure, { partNumber: string; partText: string; }[]> = new Right([]);
    mockRepository.getPartNumbersAndPartTexts.resolves(repositoryResult);

    // act
    const result = await usecase(params);

    // assert
    equal(result, repositoryResult);
  });
});
