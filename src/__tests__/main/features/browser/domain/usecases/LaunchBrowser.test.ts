import { stubInterface } from 'ts-sinon';
import { BrowserContext, FirefoxBrowser } from 'playwright-firefox';
import { equal, ok } from 'assert';
import { Either, Right } from '@typed-f/either';
import BrowserRepository from '../../../../../../main/features/browser/domain/repositories/BrowserRepository';
import { ILaunchBrowser, LaunchBrowser, LaunchBrowserParams } from '../../../../../../main/features/browser/domain/usecases/LaunchBrowser';
import { Failure } from '../../../../../../main/core/error/failures';
import StealthBrowser from '../../../../../../main/features/browser/domain/entities/StealthBrowser';

const mockRepository = stubInterface<BrowserRepository>();

const mockBrowser: FirefoxBrowser = stubInterface<FirefoxBrowser>();
const mockContext: BrowserContext = stubInterface<BrowserContext>();

const usecase: ILaunchBrowser = (params?: LaunchBrowserParams) => LaunchBrowser(mockRepository, params);

describe("LaunchBrowser", () => {
    it("should call [BrowserRepository.launch] once with correct params", async () => {
        // arrange
        const params: LaunchBrowserParams = {
            headless: false,
        };

        // act
        await usecase(params);

        // assert
        ok(mockRepository.launch.calledOnceWith(params));
    });

    it("should return the value retrieved from [BrowserRepository.launch]", async () => {
        // arrange
        const params: LaunchBrowserParams = {
            headless: false,
        };

        const mockResult: StealthBrowser = {
            browser: mockBrowser,
            context: mockContext,
        }

        const repositoryResult: Either<Failure, StealthBrowser> = new Right(mockResult);
        mockRepository.launch.resolves(repositoryResult);

        // act
        const result = await usecase(params);

        // assert
        equal(result, repositoryResult);
    });
});
