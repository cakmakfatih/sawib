import { stubInterface } from 'ts-sinon';
import { equal, ok } from 'assert';
import { Either, Right } from '@typed-f/either';
import { ILoginToPartsCheck, LoginToPartsCheck, LoginToPartsCheckParams } from '../../../../../../main/features/scraper/domain/usecases/LoginToPartsCheck';
import { Failure } from '../../../../../../main/core/error/failures';
import { Page } from 'playwright-firefox';
import ScraperRepository from '../../../../../../main/features/scraper/domain/repositories/ScraperRepository';

const mockRepository = stubInterface<ScraperRepository>();
const mockPage: Page = stubInterface<Page>();

const usecase: ILoginToPartsCheck = (params: LoginToPartsCheckParams) => LoginToPartsCheck(mockRepository, params);

describe("LoginToPartsCheck", () => {
  it("should call [ScraperRepository.loginToPartsCheck] once with correct params", async () => {
    // arrange
    const params: LoginToPartsCheckParams = mockPage;

    // act
    await usecase(params);

    // assert
    ok(mockRepository.loginToPartsCheck.calledOnceWith(params));
  });

  it("should return the value retrieved from [ScraperRepository.loginToPartsCheck]", async () => {
    // arrange
    const params: LoginToPartsCheckParams = mockPage;

    const repositoryResult: Either<Failure, boolean> = new Right(true);
    mockRepository.loginToPartsCheck.resolves(repositoryResult);

    // act
    const result = await usecase(params);

    // assert
    equal(result, repositoryResult);
  });
});
