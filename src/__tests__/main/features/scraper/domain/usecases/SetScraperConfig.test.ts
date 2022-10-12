import { stubInterface } from 'ts-sinon';
import { equal, ok } from 'assert';
import { Either, Right } from '@typed-f/either';
import { ISetScraperConfig, SetScraperConfig, SetScraperConfigParams } from '../../../../../../main/features/scraper/domain/usecases/SetScraperConfig';
import { Failure } from '../../../../../../main/core/error/failures';
import ScraperRepository from '../../../../../../main/features/scraper/domain/repositories/ScraperRepository';
import ScraperConfig from 'main/features/scraper/domain/entities/ScraperConfig';

const mockRepository = stubInterface<ScraperRepository>();

const usecase: ISetScraperConfig = (params: SetScraperConfigParams) => SetScraperConfig(mockRepository, params);

describe("SetScraperConfig", () => {
  it("should call [ScraperRepository.setScraperConfig] once with correct params", () => {
    // arrange
    const params: SetScraperConfigParams = stubInterface<ScraperConfig>();

    // act
    usecase(params);

    // assert
    ok(mockRepository.setScraperConfig.calledOnceWith(params));
  });

  it("should return the value retrieved from [ScraperRepository.SetScraperConfig]", () => {
    // arrange
    const params: SetScraperConfigParams = stubInterface<ScraperConfig>();

    const repositoryResult: Either<Failure, boolean> = new Right(true);
    mockRepository.setScraperConfig.returns(repositoryResult);

    // act
    const result = usecase(params);

    // assert
    equal(result, repositoryResult);
  });
});
