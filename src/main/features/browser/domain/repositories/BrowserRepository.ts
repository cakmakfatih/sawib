import { Either } from '@typed-f/either';
import { Failure } from '../../../../core/error/failures';
import StealthBrowser from '../entities/StealthBrowser';
import { LaunchBrowserParams } from '../usecases/LaunchBrowser';
import { NewPageParams } from '../usecases/NewPage';
import { Page } from 'playwright-firefox';

interface BrowserRepository {
  launch(params?: LaunchBrowserParams): Promise<Either<Failure, StealthBrowser>>;
  newPage(params: NewPageParams): Promise<Either<Failure, Page>>;
}

export default BrowserRepository;
