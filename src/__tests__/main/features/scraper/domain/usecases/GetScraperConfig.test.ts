import { stubInterface } from 'ts-sinon';
import { equal, ok } from 'assert';
import { Either, Right } from '@typed-f/either';
import { IGetScraperConfig, GetScraperConfig } from '../../../../../../main/features/scraper/domain/usecases/GetScraperConfig';
import { Failure } from '../../../../../../main/core/error/failures';
import ScraperRepository from '../../../../../../main/features/scraper/domain/repositories/ScraperRepository';
import ScraperConfig from 'main/features/scraper/domain/entities/ScraperConfig';

const mockRepository = stubInterface<ScraperRepository>();

const usecase: IGetScraperConfig = () => GetScraperConfig(mockRepository);
const mockScraperConfig = stubInterface<ScraperConfig>();

describe("GetScraperConfig", () => {
  it("should call [ScraperRepository.getScraperConfig] once with correct params", () => {
    // act
    usecase();

    // assert
    ok(mockRepository.getScraperConfig.calledOnceWith());
  });

  it("should return the value retrieved from [ScraperRepository.getScraperConfig]", () => {
    // arrange
    const repositoryResult: Either<Failure, ScraperConfig> = new Right(mockScraperConfig);
    mockRepository.getScraperConfig.returns(repositoryResult);

    // act
    const result = usecase();

    // assert
    equal(result, repositoryResult);
  });
});
