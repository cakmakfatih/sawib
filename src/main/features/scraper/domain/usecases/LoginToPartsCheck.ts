import { Either } from '@typed-f/either';
import { Failure } from '../../../../core/error/failures';
import ScraperRepository from '../repositories/ScraperRepository';
import BotController from '../../../bot/presentation/controllers/BotController';

type LoginToPartsCheckParams = BotController;

interface ILoginToPartsCheck {
  (params: LoginToPartsCheckParams): Promise<Either<Failure, boolean>>;
}

async function LoginToPartsCheck(repository: ScraperRepository, params: LoginToPartsCheckParams): Promise<Either<Failure, boolean>> {
  return await repository.loginToPartsCheck(params);
}

export {
  LoginToPartsCheckParams,
  ILoginToPartsCheck,
  LoginToPartsCheck,
};
