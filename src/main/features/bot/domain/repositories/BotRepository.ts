import { Either } from "@typed-f/either";
import { Failure } from "main/core/error/failures";
import StealthBrowser from "main/features/browser/domain/entities/StealthBrowser";
import BotController from "../../presentation/controllers/BotController";

interface BotRepository {
  newBot(stealthBrowser: StealthBrowser): Promise<Either<Failure, BotController>>;
}

export default BotRepository;
