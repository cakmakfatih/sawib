import { stubInterface } from 'ts-sinon';
import { equal, ok } from 'assert';
import { Either, Right } from '@typed-f/either';
import BotRepository from '../../../../../../main/features/bot/domain/repositories/BotRepository';
import { ILaunchBotController, LaunchBotController } from '../../../../../../main/features/bot/domain/usecases/LaunchBotController';
import { Failure } from '../../../../../../main/core/error/failures';
import BotController from '../../../../../../main/features/bot/presentation/controllers/BotController';

const mockRepository = stubInterface<BotRepository>();

const usecase: ILaunchBotController = () => LaunchBotController(mockRepository);

describe("LaunchBotController", () => {
  it("should call [BotRepository.launchBotController] once with correct params", async () => {
    // act
    await usecase();

    // assert
    ok(mockRepository.launchBotController.calledOnceWith());
  });

  it("should return the value retrieved from [BotRepository.launchBotController]", async () => {
    // arrange
    const mockResult: BotController = stubInterface<BotController>();

    const repositoryResult: Either<Failure, BotController> = new Right(mockResult);
    mockRepository.launchBotController.resolves(repositoryResult);

    // act
    const result = await usecase();

    // assert
    equal(result, repositoryResult);
  });
});
