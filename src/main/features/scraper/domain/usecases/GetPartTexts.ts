import { Either } from '@typed-f/either';
import { Failure } from '../../../../core/error/failures';
import BotController from '../../../../features/bot/presentation/controllers/BotController';
import ScraperRepository from '../repositories/ScraperRepository';

type GetPartTextsParams = BotController;

interface IGetPartTexts {
  (params: GetPartTextsParams): Promise<Either<Failure, string[]>>;
}

async function GetPartTexts(repository: ScraperRepository, params: GetPartTextsParams): Promise<Either<Failure, string[]>> {
  return await repository.getPartTexts(params);
}

export {
  GetPartTextsParams,
  IGetPartTexts,
  GetPartTexts,
};
