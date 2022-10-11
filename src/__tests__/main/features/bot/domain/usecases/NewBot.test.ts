import { stubInterface } from 'ts-sinon';
import { equal, ok } from 'assert';
import { Either, Right } from '@typed-f/either';
import BotRepository from '../../../../../../main/features/bot/domain/repositories/BotRepository';
import { INewBot, NewBot, NewBotParams } from '../../../../../../main/features/bot/domain/usecases/NewBot';
import { Failure } from '../../../../../../main/core/error/failures';
import BotController from '../../../../../../main/features/bot/presentation/controllers/BotController';
import StealthBrowser from 'main/features/browser/domain/entities/StealthBrowser';

const mockRepository = stubInterface<BotRepository>();
const mockStealthBrowser: StealthBrowser = stubInterface<StealthBrowser>();

const usecase: INewBot = (params: NewBotParams) => NewBot(mockRepository, params);

describe("NewBot", () => {
  it("should call [BotRepository.newBot] once with correct params", async () => {
    // arrange
    const params: NewBotParams = mockStealthBrowser;

    // act
    await usecase(params);

    // assert
    ok(mockRepository.newBot.calledOnceWith(params));
  });

  it("should return the value retrieved from [BotRepository.newBot]", async () => {
    // arrange
    const params: NewBotParams = mockStealthBrowser;

    const mockResult: BotController = stubInterface<BotController>();

    const repositoryResult: Either<Failure, BotController> = new Right(mockResult);
    mockRepository.newBot.resolves(repositoryResult);

    // act
    const result = await usecase(params);

    // assert
    equal(result, repositoryResult);
  });
});
