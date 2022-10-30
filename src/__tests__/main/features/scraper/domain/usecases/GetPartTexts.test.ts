import { stubInterface } from 'ts-sinon';
import { equal, ok } from 'assert';
import { Either, Right } from '@typed-f/either';
import { IGetPartTexts, GetPartTexts, GetPartTextsParams } from '../../../../../../main/features/scraper/domain/usecases/GetPartTexts';
import { Failure } from '../../../../../../main/core/error/failures';
import ScraperRepository from '../../../../../../main/features/scraper/domain/repositories/ScraperRepository';

const mockRepository = stubInterface<ScraperRepository>();

const usecase: IGetPartTexts = (params: GetPartTextsParams) => GetPartTexts(mockRepository, params);

describe("GetPartTexts", () => {
  it("should call [ScraperRepository.getPartTexts] once with correct params", async () => {
    // arrange
    const params: GetPartTextsParams = stubInterface<GetPartTextsParams>();

    // act
    await usecase(params);

    // assert
    ok(mockRepository.getPartTexts.calledOnceWith(params));
  });

  it("should return the value retrieved from [ScraperRepository.getPartTexts]", async () => {
    // arrange
    const params: GetPartTextsParams = stubInterface<GetPartTextsParams>();
    const repositoryResult: Either<Failure, string[]> = new Right(["pn1", "pn2"]);
    mockRepository.getPartTexts.resolves(repositoryResult);

    // act
    const result = await usecase(params);

    // assert
    equal(result, repositoryResult);
  });
});
