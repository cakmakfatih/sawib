import { Either } from '@typed-f/either';
import { Failure } from '../../../../core/error/failures';
import BotController from '../../presentation/controllers/BotController';
import BotRepository from '../repositories/BotRepository';

interface ILaunchBotController {
  (): Promise<Either<Failure, BotController>>;
}

async function LaunchBotController(repository: BotRepository): Promise<Either<Failure, BotController>> {
  return await repository.launchBotController();
}

export {
  ILaunchBotController,
  LaunchBotController,
};
