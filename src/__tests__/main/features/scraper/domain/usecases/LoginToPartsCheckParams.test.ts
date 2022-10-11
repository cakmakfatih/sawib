import { stubInterface } from 'ts-sinon';
import { equal, ok } from 'assert';
import { Either, Right } from '@typed-f/either';
import { ILoginToPartsCheck, LoginToPartsCheck, LoginToPartsCheckParams } from '../../../../../../main/features/scraper/domain/usecases/LoginToPartsCheck';
import { Failure } from '../../../../../../main/core/error/failures';
import BotController from '../../../../../../main/features/bot/presentation/controllers/BotController';
import ScraperRepository from '../../../../../../main/features/scraper/domain/repositories/ScraperRepository';

const mockRepository = stubInterface<ScraperRepository>();
const mockBotController: BotController = stubInterface<BotController>();

const usecase: ILoginToPartsCheck = (params: LoginToPartsCheckParams) => LoginToPartsCheck(mockRepository, params);

describe("LoginToPartsCheck", () => {
  it("should call [ScraperRepository.loginToPartsCheck] once with correct params", async () => {
    // arrange
    const params: LoginToPartsCheckParams = mockBotController;

    // act
    await usecase(params);

    // assert
    ok(mockRepository.loginToPartsCheck.calledOnceWith(params));
  });

  it("should return the value retrieved from [ScraperRepository.loginToPartsCheck]", async () => {
    // arrange
    const params: LoginToPartsCheckParams = mockBotController;

    const repositoryResult: Either<Failure, boolean> = new Right(true);
    mockRepository.loginToPartsCheck.resolves(repositoryResult);

    // act
    const result = await usecase(params);

    // assert
    equal(result, repositoryResult);
  });
});
