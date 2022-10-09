import { stubInterface } from 'ts-sinon';
import { equal, ok } from 'assert';
import { Either, Right } from '@typed-f/either';
import BotRepository from '../../../../../../main/features/bot/domain/repositories/BotRepository';
import { ICreatePages, CreatePages, CreatePagesParams } from '../../../../../../main/features/bot/domain/usecases/CreatePages';
import { Failure } from '../../../../../../main/core/error/failures';
import { Page, BrowserContext } from 'playwright-firefox';

const mockRepository = stubInterface<BotRepository>();
const mockContext: BrowserContext = stubInterface<BrowserContext>();

const usecase: ICreatePages = (params: CreatePagesParams) => CreatePages(mockRepository, params);

describe("CreatePages", () => {
  it("should call [BotRepository.createPages] once with correct params", async () => {
    // arrange
    const params: CreatePagesParams = mockContext;

    // act
    await usecase(params);

    // assert
    ok(mockRepository.createPages.calledOnceWith(params));
  });

  it("should return the value retrieved from [BotRepository.CreatePages]", async () => {
    // arrange
    const params: CreatePagesParams = mockContext;

    const mockResult: Page[] = stubInterface<Page[]>();

    const repositoryResult: Either<Failure, Page[]> = new Right(mockResult);
    mockRepository.createPages.resolves(repositoryResult);

    // act
    const result = await usecase(params);

    // assert
    equal(result, repositoryResult);
  });
});
