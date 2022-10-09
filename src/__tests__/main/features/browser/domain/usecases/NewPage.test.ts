import { stubInterface } from 'ts-sinon';
import { BrowserContext, Page } from 'playwright-firefox';
import { equal, ok } from 'assert';
import { Either, Right } from '@typed-f/either';
import BrowserRepository from '../../../../../../main/features/browser/domain/repositories/BrowserRepository';
import { INewPage, NewPage, NewPageParams } from '../../../../../../main/features/browser/domain/usecases/NewPage';
import { Failure } from '../../../../../../main/core/error/failures';

const mockRepository = stubInterface<BrowserRepository>();

const mockContext: BrowserContext = stubInterface<BrowserContext>();

const usecase: INewPage = (params: NewPageParams) => NewPage(mockRepository, params);

describe("NewPage", () => {
  it("should call [BrowserRepository.newPage] once with correct params", async () => {
    // arrange
    const params: NewPageParams = mockContext;

    // act
    await usecase(params);

    // assert
    ok(mockRepository.newPage.calledOnceWith(params));
  });

  it("should return the value retrieved from [BrowserRepository.newPage]", async () => {
    // arrange
    const params: NewPageParams = mockContext;

    const mockResult: Page = stubInterface<Page>();

    const repositoryResult: Either<Failure, Page> = new Right(mockResult);
    mockRepository.newPage.resolves(repositoryResult);

    // act
    const result = await usecase(params);

    // assert
    equal(result, repositoryResult);
  });
});
