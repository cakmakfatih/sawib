import { Either } from '@typed-f/either';
import { Failure } from 'main/core/error/failures';
import StealthBrowser from 'main/features/browser/domain/entities/StealthBrowser';
import BotController from '../../presentation/controllers/BotController';
import { Page, BrowserContext } from 'playwright-firefox';

interface BotRepository {
  newBot(stealthBrowser: StealthBrowser): Promise<Either<Failure, BotController>>;
  createPages(context: BrowserContext): Promise<Either<Failure, Page[]>>;
}

export default BotRepository;
