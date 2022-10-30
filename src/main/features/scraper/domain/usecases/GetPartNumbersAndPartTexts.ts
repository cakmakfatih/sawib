import { Either } from '@typed-f/either';
import { Failure } from '../../../../core/error/failures';
import BotController from '../../../bot/presentation/controllers/BotController';
import ScraperRepository from '../repositories/ScraperRepository';

type GetPartNumbersAndPartTextsParams = BotController;

interface IGetPartNumbersAndPartTexts {
  (params: GetPartNumbersAndPartTextsParams): Promise<Either<Failure, { partText: string; partNumber: string; }[]>>;
}

async function GetPartNumbersAndPartTexts(repository: ScraperRepository, params: GetPartNumbersAndPartTextsParams): Promise<Either<Failure, { partNumber: string; partText: string; }[]>> {
  return await repository.getPartNumbersAndPartTexts(params);
}

export {
  GetPartNumbersAndPartTextsParams,
  IGetPartNumbersAndPartTexts,
  GetPartNumbersAndPartTexts,
};
