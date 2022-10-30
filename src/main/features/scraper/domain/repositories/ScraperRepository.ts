import { Either } from '@typed-f/either';
import BotController from 'main/features/bot/presentation/controllers/BotController';
import { Failure } from '../../../../core/error/failures';
import ScraperConfig from '../entities/ScraperConfig';
import VehicleInfo from '../entities/VehicleInfo';
import { LoginToPartsCheckParams } from '../usecases/LoginToPartsCheck';

interface ScraperRepository {
  getPartNumbers(botController: BotController): Promise<Either<Failure, string[]>>;
  getVehicleInfo(botController: BotController): Promise<Either<Failure, VehicleInfo>>;
  scrapePartNumbers(url: string): Promise<Either<Failure, boolean>>;
  loginToPartsCheck(params: LoginToPartsCheckParams): Promise<Either<Failure, boolean>>;
  savePartNumbersAsCsv(partNumbersArray: string[]): Either<Failure, boolean>;
  setScraperConfig(config: ScraperConfig): Either<Failure, boolean>;
  getScraperConfig(): Either<Failure, ScraperConfig>;
}

export default ScraperRepository;
