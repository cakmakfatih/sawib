import { Either } from '@typed-f/either';
import { Failure } from 'main/core/error/failures';
import StealthBrowser from '../entities/StealthBrowser';
import StealthBrowserLaunchOptions from '../entities/StealthBrowserLaunchOptions';
import BrowserRepository from '../repositories/BrowserRepository';

type LaunchBrowserParams = StealthBrowserLaunchOptions;

interface ILaunchBrowser {
  (params?: LaunchBrowserParams): Promise<Either<Failure, StealthBrowser>>;
}

async function LaunchBrowser(repository: BrowserRepository, params?: LaunchBrowserParams): Promise<Either<Failure, StealthBrowser>> {
  return await repository.launch(params);
}

export {
  LaunchBrowserParams,
  ILaunchBrowser,
  LaunchBrowser,
};
