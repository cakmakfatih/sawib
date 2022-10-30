import Logger from '../../../../../../main/core/Logger';
import sinon, { stubInterface } from 'ts-sinon';
import ScraperRepositoryImpl, { FS_WRITE_FILE_SYNC_FAILURE_MESSAGE, FS_WRITE_FILE_SYNC_VEHICLE_INFO_WITH_PART_NUMBERS_FAILURE_MESSAGE, PARTS_CHECK_LOGIN_URL, SCRAPER_BOT_LOGIN_TO_PARTS_CHECK_FAILURE_MESSAGE, SCRAPER_ELEMENT_HANDLES_FAILURE_MESSAGE, SCRAPER_GET_ATTRIBUTE_FAILURE_MESSAGE, SCRAPER_GET_PART_NUMBERS_AND_PART_TEXTS_FROM_PART_ROWS_FAILURE_MESSAGE, SCRAPER_GET_PART_ROWS_FAILURE_MESSAGE, SCRAPER_GET_PART_TEXTS_FROM_PART_ROWS_FAILURE_MESSAGE, SCRAPER_GET_VEHICLE_INFO_DATA_FAILURE_MESSAGE, SCRAPER_LAUNCH_BOT_CONTROLLER_WARNING_MESSAGE, SCRAPER_LOCAL_DATA_SOURCE_GET_SCRAPER_CONFIG_FAILURE_MESSAGE, SCRAPER_LOCAL_DATA_SOURCE_SET_SCRAPER_CONFIG_FAILURE_MESSAGE, SCRAPER_PAGE_CLICK_FAILURE_MESSAGE, SCRAPER_PAGE_FILL_FAILURE_MESSAGE, SCRAPER_PAGE_NAVIGATION_FAILURE_MESSAGE, SCRAPER_PAGE_WAIT_FOR_FAILURE_MESSAGE, Selectors } from '../../../../../../main/features/scraper/data/repositories/ScraperRepositoryImpl';
import ScraperLocalDataSource from '../../../../../../main/features/scraper/data/datasources/ScraperLocalDataSource';
import { deepEqual, equal, ok } from 'assert';
import { ScrapePartNumbersParams } from '../../../../../../main/features/scraper/domain/usecases/ScrapePartNumbers';
import { BrowserFailure, ScraperFailure } from '../../../../../../main/core/error/failures';
import { Left, Right } from '@typed-f/either';
import StealthBrowser from '../../../../../../main/features/browser/domain/entities/StealthBrowser';
import BotController from '../../../../../../main/features/bot/presentation/controllers/BotController';
import { Page, Locator } from 'playwright-firefox';
import jsdom from 'jsdom';
import ScraperConfig from '../../../../../../main/features/scraper/domain/entities/ScraperConfig';
import fs from 'fs';
import path from 'path';
import { GetPartNumbersParams } from '../../../../../../main/features/scraper/domain/usecases/GetPartNumbers';
import { GetVehicleInfoParams } from 'main/features/scraper/domain/usecases/GetVehicleInfo';
import VehicleInfo from 'main/features/scraper/domain/entities/VehicleInfo';
import { GetPartTextsParams } from 'main/features/scraper/domain/usecases/GetPartTexts';
import { GetPartNumbersAndPartTextsParams } from 'main/features/scraper/domain/usecases/GetPartNumbersAndPartTexts';
import { SaveVehicleInfoWithPartsDataAsCsvParams } from 'main/features/scraper/domain/usecases/SaveVehicleInfoWithPartsDataAsCsv';

const document = new jsdom.JSDOM().window.document;

const mockLogger = stubInterface<Logger>();
const mockLocalDataSource = stubInterface<ScraperLocalDataSource>();
const mockLaunchBotController = sinon.stub();

const mockStealthBrowser = stubInterface<StealthBrowser>();
const mockBotController = new BotController(mockStealthBrowser);

const closeBrowserSpy = sinon.spy();
const closeContextSpy = sinon.spy();

const mockPage: Page = stubInterface<Page>();

const mockLocator: Locator = stubInterface<Locator>();

const locatorLocatorStub = sinon.stub();

mockLocator.locator = locatorLocatorStub;

const elementHandlesStub = sinon.stub();
const elementHandleStub = sinon.stub();
const waitForStub = sinon.stub();

mockLocator.elementHandles = elementHandlesStub;
mockLocator.elementHandle = elementHandleStub;
mockLocator.waitFor = waitForStub;

const pageGoToStub = sinon.stub();
const pageLocatorStub = sinon.stub();
const pageFillStub = sinon.stub();
const pageClickStub = sinon.stub();

mockPage.goto = pageGoToStub;
mockPage.locator = pageLocatorStub;
mockPage.fill = pageFillStub;
mockPage.click = pageClickStub;

mockBotController.pages = [mockPage];
mockStealthBrowser.browser.close = closeBrowserSpy;
mockStealthBrowser.context.close = closeContextSpy;

const repository = new ScraperRepositoryImpl(
  mockLogger,
  mockLocalDataSource,
  mockLaunchBotController,
);

describe("ScraperRepository", () => {
  describe("getVehicleInfo", () => {
    function setElementHandleResults() {
      const quoteTitleAndContainersResult = [];

      const quoteTitleNodes = [];
      const quoteContentNodes = [];

      const quoteTitles: string[] = [
        "Make", "Model", "Model Nr", "Series", "Trans", "Colour", "VIN", "Body", "Mth/Yr", "Veh Reg", "Claim Nr",
      ];
      const quoteContents: string[] = [
        "Toyota", "Tarago", "ACR50R", "ACR50", "", "White (C.O.B)", "WAGON", "10/2010", "CPQ85R", "Not Submitted",
      ];

      for (let i = 0; i < quoteTitles.length; i++) {
        const quoteTitleEl = document.createElement("div");

        quoteTitleEl.setAttribute("class", "quoteTitle");
        quoteTitleEl.innerText = quoteTitles[i];

        const quoteTitleHandleMock = { ...quoteTitleEl, textContent: () => Promise.resolve(quoteTitles[i]) };

        quoteTitleNodes.push(quoteTitleHandleMock);
      }

      for (let i = 0; i < quoteContents.length; i++) {
        const quoteContentEl = document.createElement("div");

        quoteContentEl.setAttribute("class", "quoteTitleContent");
        quoteContentEl.innerText = quoteContents[i];

        const quoteContentHandleMock = { ...quoteContentEl, textContent: () => Promise.resolve(quoteContents[i]) };

        quoteContentNodes.push(quoteContentHandleMock);
      }

      for (let i = 0; i < (quoteTitleNodes.length + quoteContentNodes.length); i++) {
        let nodeToPush: any;

        if (i < 13) {
          nodeToPush = i % 2 === 0 ? quoteTitleNodes[i / 2] : quoteContentNodes[Math.floor(i / 2)];
        } else {
          nodeToPush = i % 2 === 1 ? quoteTitleNodes[Math.ceil(i / 2)] : quoteContentNodes[Math.floor((i - 1) / 2)];
        }

        quoteTitleAndContainersResult.push(nodeToPush);
      }

      const vehicleVinInputEl = document.createElement("input");
      vehicleVinInputEl.setAttribute("value", "JTEGD52M10A025060")

      elementHandlesStub.resolves(quoteTitleAndContainersResult);
      elementHandleStub.resolves(vehicleVinInputEl);
    }

    let getVehicleInfoParams: GetVehicleInfoParams = mockBotController;
    let expectedVehicleInfo: VehicleInfo = {
      make: "Toyota",
      model: "Tarago",
      modelNr: "ACR50R",
      series: "ACR50",
      trans: "NA",
      colour: "White (C.O.B)",
      vin: "JTEGD52M10A025060",
      body: "WAGON",
      mthYr: "10/2010",
      vehReg: "CPQ85R",
      claimNr: "Not Submitted",
    };

    beforeEach(() => {
      mockLogger.info.resetHistory();
      mockLogger.warn.resetHistory();
      mockLogger.error.resetHistory();
      pageLocatorStub.resetHistory();
      locatorLocatorStub.resetHistory();
      elementHandlesStub.resetHistory();
      elementHandleStub.resetHistory();
    });

    it("should call [Logger.info] correctly", async () => {
      // arrange
      pageLocatorStub.returns(mockLocator);
      locatorLocatorStub.returns(mockLocator);
      setElementHandleResults();

      // act
      await repository.getVehicleInfo(getVehicleInfoParams);

      // assert
      ok(mockLogger.info.calledWith("[ScraperRepository.getVehicleInfo] started."));
      ok(mockLogger.info.calledWith("[ScraperRepository.getVehicleInfo] completed."));
      equal(mockLogger.info.callCount, 2);
    });

    it("should call [page.locator] on [vehicleInfosContainer] to get the vehicle info container", async () => {
      // arrange
      pageLocatorStub.returns(mockLocator);
      locatorLocatorStub.returns(mockLocator);
      setElementHandleResults();

      // act
      await repository.getVehicleInfo(getVehicleInfoParams);

      // assert
      ok(pageLocatorStub.calledOnceWith(Selectors.vehicleInfoContainer));
    });

    it("should call [page.locator] on [vehicleInfosContainerLocator] with [vehicleInfo] & [vehicleVinInfo] to get each individual part", async () => {
      // arrange
      pageLocatorStub.returns(mockLocator);
      locatorLocatorStub.returns(mockLocator);
      setElementHandleResults();

      // act
      await repository.getVehicleInfo(getVehicleInfoParams);

      // assert
      ok(pageLocatorStub.calledOnceWith(Selectors.vehicleInfoContainer));
      ok(locatorLocatorStub.calledWith(Selectors.vehicleInfoDivs));
      ok(locatorLocatorStub.calledWith(Selectors.vehicleVinInfo));
      equal(locatorLocatorStub.callCount, 2);
    });

    it("should call [elementHandles] on [vehicleInfosContainerLocator] and [elementHandle] on [vehicleVinInfoLocator]", async () => {
      // arrange
      pageLocatorStub.returns(mockLocator);
      locatorLocatorStub.returns(mockLocator);
      setElementHandleResults();

      // act
      await repository.getVehicleInfo(getVehicleInfoParams);

      // assert
      ok(elementHandlesStub.calledOnceWith());
      ok(elementHandleStub.calledOnceWith());
    });

    it("should return a [Failure] if [handleVehicleInfoScraping] throws", async () => {
      // arrange
      pageLocatorStub.returns(mockLocator);
      locatorLocatorStub.returns(mockLocator);
      setElementHandleResults();
      const err = new Error("test-err");
      elementHandleStub.rejects(err);

      // act
      const result = await repository.getVehicleInfo(getVehicleInfoParams);

      // assert
      ok(mockLogger.info.calledWith("[ScraperRepository.getVehicleInfo] completed with a [Failure]."));
      ok(mockLogger.error.calledOnceWith(err));
      ok(mockLogger.warn.calledOnceWith(SCRAPER_GET_VEHICLE_INFO_DATA_FAILURE_MESSAGE));
      deepEqual(result, new Left(new ScraperFailure(SCRAPER_GET_VEHICLE_INFO_DATA_FAILURE_MESSAGE, err)));
    });

    it("should return expected [VehicleInfo]", async () => {
      // arrange
      pageLocatorStub.returns(mockLocator);
      locatorLocatorStub.returns(mockLocator);
      setElementHandleResults();

      // act
      const result = await repository.getVehicleInfo(getVehicleInfoParams);

      // assert
      deepEqual(result, new Right(expectedVehicleInfo));
    });
  });

  describe("getPartNumbers", () => {
    let getPartNumbersParams: GetPartNumbersParams = mockBotController;

    beforeEach(() => {
      mockLogger.info.resetHistory();
      mockLogger.warn.resetHistory();
      mockLogger.error.resetHistory();
      elementHandlesStub.resetHistory();
      pageLocatorStub.resetHistory();
    });

    it("should call [Logger.info] correctly", async () => {
      // arrange
      pageLocatorStub.returns(mockLocator);
      elementHandlesStub.resolves([]);

      // act
      await repository.getPartNumbers(getPartNumbersParams);

      // assert
      ok(mockLogger.info.calledWith("[ScraperRepository.getPartNumbers] started."));
      ok(mockLogger.info.calledWith("[ScraperRepository.getPartNumbers] completed."));
      equal(mockLogger.info.callCount, 2);
    });

    it("should call [page.locator] on [partNrSelector] to get all elements with [elementHandles]", async () => {
      // arrange
      pageLocatorStub.returns(mockLocator);

      const nodes: Node[] = [];

      const inputCount = Math.floor(Math.random() * 11);

      for (let i = 0; i < inputCount; i++) {
        const examplePartNumInput = document.createElement("input");
        examplePartNumInput.setAttribute("value", `partnum-${i}`);

        nodes.push(examplePartNumInput);
      }

      elementHandlesStub.resolves(nodes);

      // act
      await repository.getPartNumbers(getPartNumbersParams);

      // assert
      ok(pageLocatorStub.calledOnceWith(Selectors.partNumberInp));
      ok(elementHandlesStub.calledOnceWith());
    });

    it("should log correctly return a [Failure] if [elementHandles] rejects", async () => {
      // arrange
      pageLocatorStub.returns(mockLocator);
      const err = new Error("test-err");
      const expectedFailure = new ScraperFailure(SCRAPER_ELEMENT_HANDLES_FAILURE_MESSAGE, err);
      elementHandlesStub.rejects(err);

      // act
      const result = await repository.getPartNumbers(getPartNumbersParams);

      // assert
      ok(pageLocatorStub.calledOnceWith(Selectors.partNumberInp));
      ok(elementHandlesStub.calledOnceWith());
      ok(mockLogger.info.calledWith("[ScraperRepository.getPartNumbers] completed with a [Failure]."));
      ok(mockLogger.warn.calledWith(expectedFailure.message));
      ok(mockLogger.error.calledWith(err));
      deepEqual(result, new Left(expectedFailure));
    });

    it("should log correctly and return a [Failure] if [element.getAttribute] rejects", async () => {
      // arrange
      const node: HTMLElement = stubInterface<HTMLElement>();
      const getAttributeStub = sinon.stub();
      node.getAttribute = getAttributeStub;

      pageLocatorStub.returns(mockLocator);
      const err = new Error("test-err");
      getAttributeStub.rejects(err);
      elementHandlesStub.rejects(err);
      const expectedFailure = new ScraperFailure(SCRAPER_GET_ATTRIBUTE_FAILURE_MESSAGE, err);

      const nodes = [
        node,
      ];

      elementHandlesStub.resolves(nodes);

      // act
      const result = await repository.getPartNumbers(getPartNumbersParams);

      // assert
      ok(mockLogger.info.calledWith("[ScraperRepository.getPartNumbers] completed with a [Failure]."));
      ok(mockLogger.warn.calledWith(expectedFailure.message));
      ok(mockLogger.error.calledWith(err));
      deepEqual(result, new Left(expectedFailure));
    });

    it("should return [partNumbers<string[]>] if everything ran without an issue", async () => {
      // arrange
      pageLocatorStub.returns(mockLocator);

      const nodes: Node[] = [];

      const inputCount = Math.floor(Math.random() * 11);

      for (let i = 0; i < inputCount; i++) {
        const examplePartNumInput = document.createElement("input");
        examplePartNumInput.setAttribute("value", `partnum-${i}`);

        nodes.push(examplePartNumInput);
      }

      elementHandlesStub.resolves(nodes);

      const expectedData = [];

      for (let i = 0; i < inputCount; i++) {
        expectedData.push(`partnum-${i}`);
      }

      // act
      const result = await repository.getPartNumbers(getPartNumbersParams);

      // assert
      deepEqual(result, new Right(expectedData));
    });
  });

  describe("getPartTexts", () => {
    let getPartTextsParams: GetPartTextsParams = mockBotController;

    beforeEach(() => {
      mockLogger.info.resetHistory();
      mockLogger.warn.resetHistory();
      mockLogger.error.resetHistory();
      elementHandlesStub.resetHistory();
      pageLocatorStub.resetHistory();
    });

    it("should call [Logger.info] correctly", async () => {
      // arrange
      pageLocatorStub.returns(mockLocator);
      elementHandlesStub.resolves([]);

      // act
      await repository.getPartTexts(getPartTextsParams);

      // assert
      ok(mockLogger.info.calledWith("[ScraperRepository.getPartTextsParams] started."));
      ok(mockLogger.info.calledWith("[ScraperRepository.getPartTextsParams] completed."));
      equal(mockLogger.info.callCount, 2);
    });

    it("should call [page.locator] on [partRowTr]", async () => {
      // arrange
      pageLocatorStub.returns(mockLocator);
      elementHandlesStub.resolves([]);

      // act
      await repository.getPartTexts(getPartTextsParams);

      // assert
      ok(pageLocatorStub.calledOnceWith(Selectors.partRowTr));
    });

    it("should call [elementHandles] on [locator]", async () => {
      // arrange
      pageLocatorStub.returns(mockLocator);
      elementHandlesStub.resolves([]);

      // act
      await repository.getPartTexts(getPartTextsParams);

      // assert
      ok(elementHandlesStub.calledOnceWith());
    });

    it("should handle [Failure] if [elementHandles] rejects", async () => {
      // arrange
      pageLocatorStub.returns(mockLocator);
      const err = new Error("test-err");
      elementHandlesStub.rejects(err);
      const expectedFailure = new ScraperFailure(SCRAPER_GET_PART_ROWS_FAILURE_MESSAGE, err);

      // act
      const result = await repository.getPartTexts(getPartTextsParams);

      // assert
      ok(elementHandlesStub.calledOnceWith());
      ok(mockLogger.info.calledWith("[ScraperRepository.getPartTextsParams] completed with a [Failure]."));
      ok(mockLogger.warn.calledOnceWith(SCRAPER_GET_PART_ROWS_FAILURE_MESSAGE));
      ok(mockLogger.error.calledOnceWith(err));
      deepEqual(result, new Left(expectedFailure));
    });

    it("should handle [Failure] if [getAttribute] rejects", async () => {
      // arrange
      pageLocatorStub.returns(mockLocator);
      const err = new Error("test-err");

      const node: HTMLElement = stubInterface<HTMLElement>();
      const getAttributeStub = sinon.stub();
      node.getAttribute = getAttributeStub;

      elementHandlesStub.resolves([
        node,
        node,
        node,
      ]);

      getAttributeStub.rejects(err);

      const expectedFailure = new ScraperFailure(SCRAPER_GET_PART_TEXTS_FROM_PART_ROWS_FAILURE_MESSAGE, err);

      // act
      const result = await repository.getPartTexts(getPartTextsParams);

      // assert
      ok(elementHandlesStub.calledOnceWith());
      ok(mockLogger.info.calledWith("[ScraperRepository.getPartTextsParams] completed with a [Failure]."));
      ok(mockLogger.warn.calledOnceWith(SCRAPER_GET_PART_TEXTS_FROM_PART_ROWS_FAILURE_MESSAGE));
      ok(mockLogger.error.calledOnceWith(err));
      deepEqual(result, new Left(expectedFailure));
    });

    it("should call [getAttribute('data-parttext')] on each row", async () => {
      // arrange
      pageLocatorStub.returns(mockLocator);

      const node: HTMLElement = stubInterface<HTMLElement>();
      const getAttributeStub = sinon.stub();
      node.getAttribute = getAttributeStub;

      elementHandlesStub.resolves([
        node,
        node,
        node,
      ]);

      getAttributeStub.resolves("");

      // act
      await repository.getPartTexts(getPartTextsParams);

      // assert
      ok(getAttributeStub.calledWith('data-parttext'));
      equal(getAttributeStub.callCount, 3);
    });

    it("should return [partTexts<string[]>] if everything ran without an issue", async () => {
      // arrange
      pageLocatorStub.returns(mockLocator);

      const node: HTMLElement = stubInterface<HTMLElement>();
      const getAttributeStub = sinon.stub();
      node.getAttribute = getAttributeStub;

      elementHandlesStub.resolves([
        node,
        node,
        node,
        node,
      ]);

      getAttributeStub.onCall(0).resolves("text-1");
      getAttributeStub.onCall(1).resolves("text-2");
      getAttributeStub.onCall(2).resolves("text-3");
      getAttributeStub.onCall(3).resolves("text-4");

      const expectedResult = ["text-1", "text-2", "text-3", "text-4"];

      // act
      const result = await repository.getPartTexts(getPartTextsParams);

      // assert
      deepEqual(result, new Right(expectedResult));
    });
  });

  describe("getPartNumbersAndPartTexts", () => {
    let getPartNumbersAndPartTextsParams: GetPartNumbersAndPartTextsParams = mockBotController;

    beforeEach(() => {
      mockLogger.info.resetHistory();
      mockLogger.warn.resetHistory();
      mockLogger.error.resetHistory();
      elementHandlesStub.resetHistory();
      pageLocatorStub.resetHistory();
    });

    it("should call [Logger.info] correctly", async () => {
      // arrange
      pageLocatorStub.returns(mockLocator);

      // act
      await repository.getPartNumbersAndPartTexts(getPartNumbersAndPartTextsParams);

      // assert
      ok(mockLogger.info.calledWith("[ScraperRepository.getPartNumbersAndPartTexts] started."));
      ok(mockLogger.info.calledWith("[ScraperRepository.getPartNumbersAndPartTexts] completed."));
      equal(mockLogger.info.callCount, 2);
    });

    it("should call [page.locator] on [partRowTr]", async () => {
      // arrange
      pageLocatorStub.returns(mockLocator);
      elementHandlesStub.resolves([]);

      // act
      await repository.getPartNumbersAndPartTexts(getPartNumbersAndPartTextsParams);

      // assert
      ok(pageLocatorStub.calledOnceWith(Selectors.partRowTr));
    });

    it("should call [elementHandles] on [locator]", async () => {
      // arrange
      pageLocatorStub.returns(mockLocator);
      elementHandlesStub.resolves([]);

      // act
      await repository.getPartNumbersAndPartTexts(getPartNumbersAndPartTextsParams);

      // assert
      ok(elementHandlesStub.calledOnceWith());
    });

    it("should handle [Failure] if [elementHandles] rejects", async () => {
      // arrange
      pageLocatorStub.returns(mockLocator);
      const err = new Error("test-err");
      elementHandlesStub.rejects(err);
      const expectedFailure = new ScraperFailure(SCRAPER_GET_PART_ROWS_FAILURE_MESSAGE, err);

      // act
      const result = await repository.getPartNumbersAndPartTexts(getPartNumbersAndPartTextsParams);

      // assert
      ok(elementHandlesStub.calledOnceWith());
      ok(mockLogger.info.calledWith("[ScraperRepository.getPartNumbersAndPartTexts] completed with a [Failure]."));
      ok(mockLogger.warn.calledOnceWith(SCRAPER_GET_PART_ROWS_FAILURE_MESSAGE));
      ok(mockLogger.error.calledOnceWith(err));
      deepEqual(result, new Left(expectedFailure));
    });

    it("should call [$(partNrSelector)] on each [partRow]", async () => {
      // arrange
      pageLocatorStub.returns(mockLocator);
      const node = stubInterface<any>();
      const $stub = sinon.stub();
      node.$ = $stub;
      elementHandlesStub.resolves([
        node,
        node,
      ]);

      const inputElement = document.createElement("input");

      $stub.resolves(inputElement);

      // act
      await repository.getPartNumbersAndPartTexts(getPartNumbersAndPartTextsParams);

      // assert
      ok(elementHandlesStub.calledOnceWith());
      ok($stub.calledWith(Selectors.partNumberInp));
      equal($stub.callCount, 2);
    });

    it("should call [getAttribute] with 'value' on input element(s) & [getAttribute('data-parttext')] on [partRowTr]", async () => {
      // arrange
      pageLocatorStub.returns(mockLocator);
      const node = stubInterface<any>();
      const $stub = sinon.stub();
      node.$ = $stub;
      const partTextGetAttributeStub = sinon.stub();
      node.getAttribute = partTextGetAttributeStub;
      elementHandlesStub.resolves([
        node,
        node,
        node,
      ]);

      const inputGetAttributeStub = sinon.stub();

      const inputElement = document.createElement("input");
      inputElement.getAttribute = inputGetAttributeStub;

      $stub.resolves(inputElement);
      inputGetAttributeStub.resolves("part-num");

      // act
      await repository.getPartNumbersAndPartTexts(getPartNumbersAndPartTextsParams);

      // assert
      ok(inputGetAttributeStub.calledWith("value"));
      ok(partTextGetAttributeStub.calledWith('data-parttext'));
      equal(partTextGetAttributeStub.callCount, 3);
      equal(inputGetAttributeStub.callCount, 3);
    });

    it("should return [Failure] if scraping [getPartNumbersAndPartTextsFromPartRows] rejects", async () => {
      // arrange
      pageLocatorStub.returns(mockLocator);
      const err = new Error("test-err");
      const node = stubInterface<any>();
      const $stub = sinon.stub();
      node.$ = $stub;
      elementHandlesStub.resolves([
        node,
        node,
        node,
      ]);

      const inputGetAttributeStub = sinon.stub();

      const inputElement = document.createElement("input");
      inputElement.getAttribute = inputGetAttributeStub;

      $stub.resolves(inputElement);
      inputGetAttributeStub.onCall(0).resolves("partNum");
      inputGetAttributeStub.onCall(1).rejects(err);
      inputGetAttributeStub.onCall(2).resolves("partNum");

      const expectedFailure = new ScraperFailure(SCRAPER_GET_PART_NUMBERS_AND_PART_TEXTS_FROM_PART_ROWS_FAILURE_MESSAGE, err);

      // act
      const result = await repository.getPartNumbersAndPartTexts(getPartNumbersAndPartTextsParams);

      // assert
      ok(inputGetAttributeStub.calledWith("value"));
      ok(mockLogger.info.calledWith("[ScraperRepository.getPartNumbersAndPartTexts] completed with a [Failure]."));
      ok(mockLogger.warn.calledOnceWith(SCRAPER_GET_PART_NUMBERS_AND_PART_TEXTS_FROM_PART_ROWS_FAILURE_MESSAGE));
      ok(mockLogger.error.calledOnceWith(err));
      equal(inputGetAttributeStub.callCount, 2);
      deepEqual(result, new Left(expectedFailure));
    });

    it("should return [{ partNumber:string; partText: string; }[]] if everything ran without an issue", async () => {
      // arrange
      pageLocatorStub.returns(mockLocator);
      const node = stubInterface<any>();
      const $stub = sinon.stub();
      const partTextGetAttributeStub = sinon.stub();
      node.$ = $stub;
      node.getAttribute = partTextGetAttributeStub;
      elementHandlesStub.resolves([
        node,
        node,
        node,
      ]);

      const inputGetAttributeStub = sinon.stub();

      const inputElement = document.createElement("input");

      inputElement.getAttribute = inputGetAttributeStub;

      partTextGetAttributeStub.onCall(0).resolves("part-text1");
      partTextGetAttributeStub.onCall(1).resolves("part-text2");
      partTextGetAttributeStub.onCall(2).resolves("part-text3");

      $stub.resolves(inputElement);
      inputGetAttributeStub.onCall(0).resolves("part-num1");
      inputGetAttributeStub.onCall(1).resolves("part-num2");
      inputGetAttributeStub.onCall(2).resolves("part-num3");

      const expectedResult: {
        partNumber: string;
        partText: string;
      }[] = [
          {
            partNumber: "part-num1",
            partText: "part-text1",
          },
          {
            partNumber: "part-num2",
            partText: "part-text2",
          },
          {
            partNumber: "part-num3",
            partText: "part-text3",
          },
        ];

      // act
      const result = await repository.getPartNumbersAndPartTexts(getPartNumbersAndPartTextsParams);

      // assert
      deepEqual(result, new Right(expectedResult));
    });
  });

  describe("scrapePartNumbers", () => {
    let savePartNumbersAsCsvStub: sinon.SinonStub;
    let getPartNumbersStub: sinon.SinonStub;
    let loginToPartsCheckStub: sinon.SinonStub;

    beforeAll(() => {
      getPartNumbersStub = sinon.stub(repository, "getPartNumbers");
      savePartNumbersAsCsvStub = sinon.stub(repository, "savePartNumbersAsCsv");
      loginToPartsCheckStub = sinon.stub(repository, "loginToPartsCheck");
    });

    beforeEach(() => {
      mockLogger.info.resetHistory();
      mockLogger.warn.resetHistory();
      mockLogger.error.resetHistory();
      mockLaunchBotController.resetHistory();
      closeBrowserSpy.resetHistory();
      closeContextSpy.resetHistory();
      savePartNumbersAsCsvStub.resetHistory();
      getPartNumbersStub.resetHistory();
      loginToPartsCheckStub.resetHistory();
      pageGoToStub.resetHistory();
    });

    it("should call [Logger.info] correctly", async () => {
      // arrange
      const params: ScrapePartNumbersParams = "test-url";
      mockLaunchBotController.resolves(new Right(mockBotController));
      loginToPartsCheckStub.resolves(new Right(true));
      pageGoToStub.resolves();
      savePartNumbersAsCsvStub.returns(new Right(true));
      getPartNumbersStub.resolves(new Right([""]));

      // act
      await repository.scrapePartNumbers(params);

      // assert
      ok(mockLogger.info.calledWith("[ScraperRepository.scrapePartNumbers] started."));
      ok(mockLogger.info.calledWith("[ScraperRepository.scrapePartNumbers] completed."));
      equal(mockLogger.info.callCount, 2);
    });

    it("should return [Failure] if [launchBotController] fails", async () => {
      // arrange
      const params: ScrapePartNumbersParams = "test-url";
      const err = new Error("test-err");
      const expectedFailure = new BrowserFailure(SCRAPER_LAUNCH_BOT_CONTROLLER_WARNING_MESSAGE, err);
      mockLaunchBotController.resolves(new Left(expectedFailure));

      // act
      const result = await repository.scrapePartNumbers(params);

      // assert
      ok(mockLogger.info.calledWith("[ScraperRepository.scrapePartNumbers] started."));
      ok(mockLogger.info.calledWith("[ScraperRepository.scrapePartNumbers] completed with a [Failure]."));
      ok(mockLogger.warn.calledOnceWith(expectedFailure.message));
      deepEqual(result, new Left(expectedFailure));
    });

    it("should call [loginToPartsCheck] with correct params", async () => {
      // arrange
      const params: ScrapePartNumbersParams = "test-url";
      mockLaunchBotController.resolves(new Right(mockBotController));
      loginToPartsCheckStub.resolves(new Right(true));
      pageGoToStub.resolves();

      // act
      await repository.scrapePartNumbers(params);

      // assert
      ok(loginToPartsCheckStub.calledOnceWith(mockBotController.pages[0]));
    });

    it("should call [goto] with correct URL to Quotes using one of the [controller.pages]", async () => {
      // arrange
      const params = "test-url";
      mockLaunchBotController.resolves(new Right(mockBotController));
      loginToPartsCheckStub.resolves(new Right(true));
      pageGoToStub.resolves();
      pageLocatorStub.returns(mockLocator);
      elementHandlesStub.resolves([]);

      // act
      await repository.scrapePartNumbers(params);

      // assert
      ok(pageGoToStub.calledOnceWith(params));
    });

    it("should return [ScraperFailure] if navigation to the [page.goto] rejects", async () => {
      // arrange
      const params = "test-url";
      mockLaunchBotController.resolves(new Right(mockBotController));
      loginToPartsCheckStub.resolves(new Right(true));
      const err = new Error("err");
      pageGoToStub.rejects(err);

      const failure = new ScraperFailure(SCRAPER_PAGE_NAVIGATION_FAILURE_MESSAGE, err);

      // act
      const result = await repository.scrapePartNumbers(params);

      // assert
      ok(pageGoToStub.calledOnceWith(params));
      ok(mockLogger.info.calledWith("[ScraperRepository.scrapePartNumbers] completed with a [Failure]."));
      ok(mockLogger.warn.calledWith(failure.message));
      ok(mockLogger.error.calledWith(err));
      ok(closeContextSpy.calledOnceWith());
      ok(closeBrowserSpy.calledOnceWith());
      deepEqual(result, new Left(failure));
    });

    it("should return [Failure] if [loginToPartsCheck] fails", async () => {
      // arrange
      const params: ScrapePartNumbersParams = "test-url";
      const err = new Error("scraper err");
      const scraperFailure = new ScraperFailure("scraper failure", err);
      mockLaunchBotController.resolves(new Right(mockBotController));
      loginToPartsCheckStub.resolves(new Left(scraperFailure));
      pageGoToStub.resolves();

      // act
      const result = await repository.scrapePartNumbers(params);

      // assert
      deepEqual(result, new Left(scraperFailure));
      ok(mockLogger.info.calledWith("[ScraperRepository.scrapePartNumbers] completed with a [Failure]."));
      ok(mockLogger.warn.calledOnceWith(SCRAPER_BOT_LOGIN_TO_PARTS_CHECK_FAILURE_MESSAGE));
      ok(closeContextSpy.calledOnceWith());
      ok(closeBrowserSpy.calledOnceWith());
    });

    it("should call [getPartNumbers] with correct params", async () => {
      // arrange
      const params: ScrapePartNumbersParams = "test-url";
      mockLaunchBotController.resolves(new Right(mockBotController));
      loginToPartsCheckStub.resolves(new Right(true));
      getPartNumbersStub.resolves(new Right([""]));
      pageGoToStub.resolves();
      const expectedGetPartNumbersParams = mockBotController;

      // act
      await repository.scrapePartNumbers(params);

      // assert
      ok(getPartNumbersStub.calledOnceWith(expectedGetPartNumbersParams));
    });

    it("should return [Failure] and dispose [browser] if [getPartNumbers] fails", async () => {
      // arrange
      const params: ScrapePartNumbersParams = "test-url";
      mockLaunchBotController.resolves(new Right(mockBotController));
      loginToPartsCheckStub.resolves(new Right(true));
      pageGoToStub.resolves();
      const err = new Error("test-err");
      const expectedFailure = new ScraperFailure("test-failure", err);
      getPartNumbersStub.resolves(new Left(expectedFailure));

      // act
      const result = await repository.scrapePartNumbers(params);

      // assert
      ok(mockLogger.info.calledWith("[ScraperRepository.scrapePartNumbers] completed with a [Failure]."));
      ok(closeContextSpy.calledOnceWith());
      ok(closeBrowserSpy.calledOnceWith());
      deepEqual(result, new Left(expectedFailure));
    });

    it("should call [savePartNumbersAsCsv] with correct params", async () => {
      // arrange
      const urlToScrape = "http://v1.partscheck.com.au/appV2/price-quote.php?draftID=9725056&rURL=quotes-incoming.php";
      mockLaunchBotController.resolves(new Right(mockBotController));
      loginToPartsCheckStub.resolves(new Right(true));
      pageGoToStub.resolves();
      const getPartNumbersResult = ["res-1", "res-2"];
      getPartNumbersStub.resolves(new Right(getPartNumbersResult));

      // act
      await repository.scrapePartNumbers(urlToScrape);

      // assert
      ok(savePartNumbersAsCsvStub.calledOnceWith(getPartNumbersResult));
    });

    it("should log correctly and return a [Failure] if [savePartNumbers] throws", async () => {
      // arrange
      const urlToScrape = "http://v1.partscheck.com.au/appV2/price-quote.php?draftID=9725056&rURL=quotes-incoming.php";
      mockLaunchBotController.resolves(new Right(mockBotController));
      loginToPartsCheckStub.resolves(new Right(true));
      pageGoToStub.resolves();
      const savePartNumberFailure = new ScraperFailure("test-failure");
      savePartNumbersAsCsvStub.returns(new Left(savePartNumberFailure));

      // act
      const result = await repository.scrapePartNumbers(urlToScrape);

      // assert
      ok(mockLogger.info.calledWith("[ScraperRepository.scrapePartNumbers] completed with a [Failure]."));
      ok(closeContextSpy.calledOnceWith());
      ok(closeBrowserSpy.calledOnceWith());
      deepEqual(result, new Left(savePartNumberFailure));
    });

    it("should return [Right<true>] if everything ran without an issue and dispose browser", async () => {
      // arrange
      const urlToScrape = "http://v1.partscheck.com.au/appV2/price-quote.php?draftID=9725056&rURL=quotes-incoming.php";
      mockLaunchBotController.resolves(new Right(mockBotController));
      loginToPartsCheckStub.resolves(new Right(true));
      pageGoToStub.resolves();
      savePartNumbersAsCsvStub.returns(new Right(true));
      getPartNumbersStub.resolves(new Right([""]));
      const expectedResult = true;

      // act
      const result = await repository.scrapePartNumbers(urlToScrape);

      // assert
      ok(closeContextSpy.calledOnceWith());
      ok(closeBrowserSpy.calledOnceWith());
      deepEqual(result, new Right(expectedResult));
    });

    afterAll(() => {
      savePartNumbersAsCsvStub.restore();
      getPartNumbersStub.restore();
      loginToPartsCheckStub.restore();
    });
  });

  describe("loginToPartsCheck", () => {
    let getScraperConfigStub: sinon.SinonStub;
    let scraperConfig: ScraperConfig;

    beforeAll(() => {
      getScraperConfigStub = sinon.stub(repository, "getScraperConfig");
      scraperConfig = {
        partsCheckCredentials: {
          username: "test-username",
          password: "test-password",
        },
        savePath: "test-path",
      };
    });

    beforeEach(() => {
      mockLogger.info.resetHistory();
      mockLogger.warn.resetHistory();
      mockLogger.error.resetHistory();
      getScraperConfigStub.resetHistory();
      pageGoToStub.resetHistory();
      pageFillStub.resetHistory();
      pageClickStub.resetHistory();
      pageLocatorStub.resetHistory();
      waitForStub.resetHistory();
    });

    it("should call [Logger.info] correctly", async () => {
      // arrange
      getScraperConfigStub.returns(new Right(scraperConfig));
      pageGoToStub.resolves();
      pageFillStub.resolves();
      pageClickStub.resolves();
      waitForStub.resolves();

      // act
      await repository.loginToPartsCheck(mockPage);

      // assert
      ok(mockLogger.info.calledWith("[ScraperRepository.loginToPartsCheck] started."));
      ok(mockLogger.info.calledWith("[ScraperRepository.loginToPartsCheck] completed."));
      equal(mockLogger.info.callCount, 2);
    });

    it("should call [getScraperConfig] and return [Failure] if it fails, and dispose page", async () => {
      // arrange
      const err = new Error("test-err");
      const expectedFailure = new ScraperFailure("test-failure", err);
      getScraperConfigStub.returns(new Left(expectedFailure));

      // act
      const result = await repository.loginToPartsCheck(mockPage);

      // assert
      ok(mockLogger.info.calledWith("[ScraperRepository.loginToPartsCheck] completed with a [Failure]."));
      ok(getScraperConfigStub.calledOnceWith());
      deepEqual(result, new Left(expectedFailure));
    });

    it("should call [page.goto] with correct params", async () => {
      // arrange
      getScraperConfigStub.returns(new Right(scraperConfig));
      pageGoToStub.resolves();
      pageFillStub.resolves();
      pageClickStub.resolves();
      waitForStub.resolves();

      // act
      await repository.loginToPartsCheck(mockPage);

      // assert
      ok(pageGoToStub.calledOnceWith(PARTS_CHECK_LOGIN_URL));
    });

    it("should return [ScraperFailure] if navigation to the [page.goto] rejects", async () => {
      // arrange
      getScraperConfigStub.returns(new Right(scraperConfig));
      const err = new Error("err");
      pageGoToStub.rejects(err);

      const failure = new ScraperFailure(SCRAPER_PAGE_NAVIGATION_FAILURE_MESSAGE, err);

      // act
      const result = await repository.loginToPartsCheck(mockPage);

      // assert
      ok(pageGoToStub.calledOnceWith(PARTS_CHECK_LOGIN_URL));
      ok(mockLogger.info.calledWith("[ScraperRepository.loginToPartsCheck] completed with a [Failure]."));
      ok(mockLogger.warn.calledWith(failure.message));
      ok(mockLogger.error.calledWith(err));
      deepEqual(result, new Left(failure));
    });

    it("should fill [username] & [password] inputs correctly", async () => {
      // arrange
      getScraperConfigStub.returns(new Right(scraperConfig));
      pageGoToStub.resolves();
      pageFillStub.resolves();
      pageClickStub.resolves();
      waitForStub.resolves();

      // act
      await repository.loginToPartsCheck(mockPage);

      // assert
      ok(pageFillStub.calledWith(Selectors.loginUsernameInp, "test-username"));
      ok(pageFillStub.calledWith(Selectors.loginPasswordInp, "test-password"));
      equal(pageFillStub.callCount, 2);
    });

    it("should return [Failure] if [page.fill] rejects", async () => {
      // arrange
      getScraperConfigStub.returns(new Right(scraperConfig));
      pageGoToStub.resolves();
      const err = new Error("test-err");
      const failure = new ScraperFailure(SCRAPER_PAGE_FILL_FAILURE_MESSAGE, err);
      pageFillStub.rejects(err);

      // act
      const result = await repository.loginToPartsCheck(mockPage);

      // assert
      ok(mockLogger.info.calledWith("[ScraperRepository.loginToPartsCheck] completed with a [Failure]."));
      ok(mockLogger.warn.calledWith(failure.message));
      ok(mockLogger.error.calledWith(err));
      deepEqual(result, new Left(failure));
    });

    it("should [page.click] with correct params", async () => {
      // arrange
      getScraperConfigStub.returns(new Right(scraperConfig));
      pageGoToStub.resolves();
      pageFillStub.resolves();
      pageClickStub.resolves();
      waitForStub.resolves();

      // act
      await repository.loginToPartsCheck(mockPage);

      // assert
      ok(pageClickStub.calledOnceWith(Selectors.loginBtn));
    });

    it("should return [Failure] if [page.click] rejects", async () => {
      // arrange
      getScraperConfigStub.returns(new Right(scraperConfig));
      pageGoToStub.resolves();
      pageFillStub.resolves();
      const err = new Error("test-err");
      const failure = new ScraperFailure(SCRAPER_PAGE_CLICK_FAILURE_MESSAGE, err);
      pageClickStub.rejects(err);

      // act
      const result = await repository.loginToPartsCheck(mockPage);

      // assert
      ok(mockLogger.info.calledWith("[ScraperRepository.loginToPartsCheck] completed with a [Failure]."));
      ok(mockLogger.warn.calledWith(failure.message));
      ok(mockLogger.error.calledWith(err));
      deepEqual(result, new Left(failure));
    });

    it("should call [page.locator] with correct params to locate authentication verification", async () => {
      // arrange
      getScraperConfigStub.returns(new Right(scraperConfig));
      pageGoToStub.resolves();
      pageFillStub.resolves();
      pageClickStub.resolves();
      pageLocatorStub.returns(mockLocator);
      waitForStub.resolves();

      // act
      await repository.loginToPartsCheck(mockPage);

      // assert
      ok(pageLocatorStub.calledOnceWith(Selectors.isLoggedIn));
    });

    it("should call [<locator>.waitForStub] with correct params on authentication verification element", async () => {
      // arrange
      getScraperConfigStub.returns(new Right(scraperConfig));
      pageGoToStub.resolves();
      pageFillStub.resolves();
      pageClickStub.resolves();
      pageLocatorStub.returns(mockLocator);
      waitForStub.resolves();

      // act
      await repository.loginToPartsCheck(mockPage);

      // assert
      ok(waitForStub.calledOnceWith({ state: "visible" }));
    });

    it("should log correctly return a [Failure] if [<locator>.waitFor] rejects", async () => {
      // arrange
      getScraperConfigStub.returns(new Right(scraperConfig));
      pageGoToStub.resolves();
      pageFillStub.resolves();
      pageClickStub.resolves();
      pageLocatorStub.returns(mockLocator);

      const err = new Error("test-err");
      const expectedFailure = new ScraperFailure(SCRAPER_PAGE_WAIT_FOR_FAILURE_MESSAGE, err);
      waitForStub.rejects(err);

      // act
      const result = await repository.loginToPartsCheck(mockPage);

      // assert
      ok(waitForStub.calledOnceWith({ state: "visible" }));
      ok(mockLogger.info.calledWith("[ScraperRepository.loginToPartsCheck] completed with a [Failure]."));
      ok(mockLogger.warn.calledOnceWith(expectedFailure.message));
      ok(mockLogger.error.calledOnceWith(err));
      deepEqual(result, new Left(expectedFailure));
    });

    it("should return [Right<true>] if everything ran correctly", async () => {
      // arrange
      getScraperConfigStub.returns(new Right(scraperConfig));
      pageGoToStub.resolves();
      pageFillStub.resolves();
      pageClickStub.resolves();
      pageLocatorStub.returns(mockLocator);
      waitForStub.resolves();

      // act
      const result = await repository.loginToPartsCheck(mockPage);

      // assert
      deepEqual(result, new Right(true));
    });

    afterAll(() => {
      getScraperConfigStub.restore();
    });
  });

  describe("savePartNumbersAsCsv", () => {
    let clock: sinon.SinonFakeTimers;
    let writeFileSyncStub: sinon.SinonStub;
    let getScraperConfigStub: sinon.SinonStub;

    let successfulCsvResult: string;
    let partNumbersData: string[];
    let scraperConfig: ScraperConfig;

    beforeAll(() => {
      getScraperConfigStub = sinon.stub(repository, "getScraperConfig");
      writeFileSyncStub = sinon.stub(fs, 'writeFileSync');

      successfulCsvResult = fs.readFileSync(path.join(__dirname, "..", "..", "..", "..", "..", "static", "scrapePartNumbersResult.csv"), "utf-8");
      partNumbersData = [
        "521596A-940",
        "52156600 70",
        "**report **",
        "**report **",
        "8156160B70"
      ];
      scraperConfig = {
        partsCheckCredentials: {
          username: "test-username",
          password: "test-password",
        },
        savePath: "test-path",
      };
    });

    beforeEach(() => {
      const fakeDate = new Date(Date.UTC(2018, 11, 24, 7, 12, 0, 0));
      clock = sinon.useFakeTimers(fakeDate);

      mockLogger.info.resetHistory();
      getScraperConfigStub.resetHistory();
      writeFileSyncStub.resetHistory();
    });

    it("should call [Logger.info] correctly", () => {
      // arrange
      getScraperConfigStub.returns(new Right(scraperConfig));
      const expectedFileName = `2018-12-24 07-12-00--part_numbers.csv`;
      writeFileSyncStub.returns(null);

      // act
      repository.savePartNumbersAsCsv(partNumbersData);

      // assert
      ok(mockLogger.info.calledWith("[ScraperRepository.savePartNumbersAsCsv] started."));
      ok(mockLogger.info.calledWith("[ScraperRepository.savePartNumbersAsCsv] completed."));
      ok(mockLogger.info.calledWith(`[ScraperRepository.savePartNumbersAsCsv] saved CSV file to ${path.join(scraperConfig.savePath, expectedFileName)}.`));
      equal(mockLogger.info.callCount, 3);
    });

    it("should call [getScraperConfig] to get file save path for part numbers", () => {
      // arrange
      getScraperConfigStub.returns(new Right(scraperConfig));
      writeFileSyncStub.returns(null);

      // act
      repository.savePartNumbersAsCsv(partNumbersData);

      // assert
      ok(getScraperConfigStub.calledOnceWith());
    });

    it("should return [Failure] if [getScraperConfig] returns a Failure", () => {
      // arrange
      const err = new Error("test-err");
      const expectedFailure = new ScraperFailure("test-failure", err);
      getScraperConfigStub.returns(new Left(expectedFailure));

      // act
      const result = repository.savePartNumbersAsCsv(partNumbersData);

      // assert
      ok(mockLogger.info.calledWith("[ScraperRepository.savePartNumbersAsCsv] completed with a [Failure]."));
      deepEqual(result, new Left(expectedFailure));
    });

    it("should call [writeFileSync] with correct params", () => {
      // arrange
      const expectedFileName = `2018-12-24 07-12-00.csv`;
      getScraperConfigStub.returns(new Right(scraperConfig));
      writeFileSyncStub.returns(null);

      // act
      repository.savePartNumbersAsCsv(partNumbersData);

      // assert
      writeFileSyncStub.calledOnceWith(path.join(scraperConfig.savePath, expectedFileName), successfulCsvResult, { encoding: "utf-8" });
    });

    it("should return [Failure] and log correctly if [writeFileSync] fails", () => {
      // arrange
      getScraperConfigStub.returns(new Right(scraperConfig));

      const err = new Error("test-err");
      writeFileSyncStub.throws(err);
      const expectedFailure = new ScraperFailure(FS_WRITE_FILE_SYNC_FAILURE_MESSAGE, err);

      // act
      const result = repository.savePartNumbersAsCsv(partNumbersData);

      // assert
      ok(mockLogger.info.calledWith("[ScraperRepository.savePartNumbersAsCsv] completed with a [Failure]."));
      ok(mockLogger.warn.calledWith(FS_WRITE_FILE_SYNC_FAILURE_MESSAGE));
      ok(mockLogger.error.calledWith(err));
      deepEqual(result, new Left(expectedFailure));
    });

    it("should return [Right<true>] if everything ran correctly", async () => {
      // arrange
      getScraperConfigStub.returns(new Right(scraperConfig));
      writeFileSyncStub.returns(null);

      // act
      const result = repository.savePartNumbersAsCsv(partNumbersData);

      // assert
      deepEqual(result, new Right(true));
    });

    afterEach(() => {
      clock.restore();
    });

    afterAll(() => {
      writeFileSyncStub.restore();
      getScraperConfigStub.restore();
    });
  });

  describe("saveVehicleInfoWithPartsDataAsCsv", () => {
    let clock: sinon.SinonFakeTimers;
    let writeFileSyncStub: sinon.SinonStub;
    let getScraperConfigStub: sinon.SinonStub;

    let successfulCsvResult: string;
    let vehicleInfoWithPartsData: SaveVehicleInfoWithPartsDataAsCsvParams;
    let scraperConfig: ScraperConfig;

    beforeAll(() => {
      getScraperConfigStub = sinon.stub(repository, "getScraperConfig");
      writeFileSyncStub = sinon.stub(fs, 'writeFileSync');

      successfulCsvResult = fs.readFileSync(path.join(__dirname, "..", "..", "..", "..", "..", "static", "scrapeVehicleInfoWithPartsDataResult.csv"), "utf-8");
      vehicleInfoWithPartsData = {
        vehicleInfo: {
          make: "Toyota",
          model: "Tarago",
          modelNr: "ACR50R",
          series: "ACR50",
          trans: "Automatic",
          colour: "White (C.O.B)",
          vin: "JTEGD52M10A025060",
          body: "WAGON",
          mthYr: "10/2010",
          vehReg: "CPQ85R",
          claimNr: "Not Submitted",
        },
        partNumbersAndTexts: [
          {
            partNumber: "",
            partText: "Rear B/Bar Cover GLI",
          },
          {
            partNumber: "",
            partText: "Rear B/Bar Reflector R/H",
          },
          {
            partNumber: "",
            partText: "Rear B/Bar Reflector L/H",
          },
          {
            partNumber: "",
            partText: "Rear B/Bar Absorber L/H",
          },
          {
            partNumber: "",
            partText: "Rear B/Bar Absorber R/H",
          },
          {
            partNumber: "",
            partText: "Rear B/Bar Bracket Centre L/H",
          },
          {
            partNumber: "",
            partText: "Rear B/Bar Bracket Centre R/H",
          },
          {
            partNumber: "",
            partText: "Rear B/Bar Upper Corner Bracket L/H",
          },
          {
            partNumber: "",
            partText: "Rear B/Bar Upper Corner Bracket R/H",
          },
          {
            partNumber: "",
            partText: "Rear B/Bar Upper Side Bracket L/H",
          },
          {
            partNumber: "",
            partText: "Rear B/Bar Upper Side Bracket R/H",
          },
          {
            partNumber: "",
            partText: "Rear B/Bar Parking Sensor Inner",
          },
          {
            partNumber: "",
            partText: "Rear B/Bar Parking Sensor Inner Retainer",
          },
          {
            partNumber: "",
            partText: "Tailgate Shell",
          },
          {
            partNumber: "",
            partText: "Tailgate Emblem Toyota Symbol",
          },
          {
            partNumber: "",
            partText: "Tailgate Badge Toyota",
          },
          {
            partNumber: "",
            partText: "Tailgate Badge Tarago + GLI",
          },
          {
            partNumber: "",
            partText: "Tailgate Garnish Upper Red",
          },
          {
            partNumber: "",
            partText: "Tailgate Garnish Upper Clip",
          },
          {
            partNumber: "",
            partText: "Tailgate Garnish",
          },
          {
            partNumber: "",
            partText: "Tailgate Garnish Seal Strip",
          },
          {
            partNumber: "",
            partText: "Tailgate Garnish Clip Outer",
          },
          {
            partNumber: "",
            partText: "Tailgate Opening Switch",
          },
          {
            partNumber: "",
            partText: "Tailgate Lock",
          },
          {
            partNumber: "",
            partText: "Tailgate Lock Cover",
          },
          {
            partNumber: "",
            partText: "Tailgate Striker",
          },
          {
            partNumber: "",
            partText: "Tailgate Weatherstrip",
          },
          {
            partNumber: "",
            partText: "Tailgate Glass Mould",
          },
          {
            partNumber: "",
            partText: "Tailgate Glass Dam Upper",
          },
          {
            partNumber: "",
            partText: "Tailgate Glass Channel Upper L/H",
          },
          {
            partNumber: "",
            partText: "Tailgate Glass Channel Upper R/H",
          },
          {
            partNumber: "",
            partText: "Beaver Panel Bumper Bracket L/H",
          },
          {
            partNumber: "",
            partText: "Beaver Panel Bumper Bracket R/H",
          },
        ],
      };
      scraperConfig = {
        partsCheckCredentials: {
          username: "test-username",
          password: "test-password",
        },
        savePath: "test-path",
      };
    });

    beforeEach(() => {
      const fakeDate = new Date(Date.UTC(2018, 11, 24, 7, 12, 0, 0));
      clock = sinon.useFakeTimers(fakeDate);

      mockLogger.info.resetHistory();
      getScraperConfigStub.resetHistory();
      writeFileSyncStub.resetHistory();
    });

    it("should call [Logger.info] correctly", () => {
      // arrange
      getScraperConfigStub.returns(new Right(scraperConfig));
      // act
      repository.saveVehicleInfoWithPartsDataAsCsv(vehicleInfoWithPartsData);

      // assert
      ok(mockLogger.info.calledWith("[ScraperRepository.saveVehicleInfoWithPartsDataAsCsv] started."));
      ok(mockLogger.info.calledWith("[ScraperRepository.saveVehicleInfoWithPartsDataAsCsv] completed."));
      equal(mockLogger.info.callCount, 2);
    });

    it("should call [getScraperConfig] to get file save path for part numbers", () => {
      // arrange
      getScraperConfigStub.returns(new Right(scraperConfig));

      // act
      repository.saveVehicleInfoWithPartsDataAsCsv(vehicleInfoWithPartsData);

      // assert
      ok(getScraperConfigStub.calledOnceWith());
    });

    it("should return [Failure] if [getScraperConfig] returns a Failure", () => {
      // arrange
      const err = new Error("test-err");
      const expectedFailure = new ScraperFailure("test-failure", err);
      getScraperConfigStub.returns(new Left(expectedFailure));

      // act
      const result = repository.saveVehicleInfoWithPartsDataAsCsv(vehicleInfoWithPartsData);

      // assert
      ok(mockLogger.info.calledWith("[ScraperRepository.saveVehicleInfoWithPartsDataAsCsv] completed with a [Failure]."));
      deepEqual(result, new Left(expectedFailure));
    });

    it("should call [writeFileSync] with correct params", () => {
      // arrange
      const expectedFileName = `2018-12-24 07-12-00--vehicle_info_with_parts_data.csv`;
      getScraperConfigStub.returns(new Right(scraperConfig));
      writeFileSyncStub.returns(null);

      // act
      repository.saveVehicleInfoWithPartsDataAsCsv(vehicleInfoWithPartsData);

      // assert
      writeFileSyncStub.calledOnceWith(path.join(scraperConfig.savePath, expectedFileName), successfulCsvResult, { encoding: "utf-8" });
    });

    it("should return [Failure] and log correctly if [writeFileSync] fails", () => {
      // arrange
      getScraperConfigStub.returns(new Right(scraperConfig));

      const err = new Error("test-err");
      writeFileSyncStub.throws(err);
      const expectedFailure = new ScraperFailure(FS_WRITE_FILE_SYNC_VEHICLE_INFO_WITH_PART_NUMBERS_FAILURE_MESSAGE, err);

      // act
      const result = repository.saveVehicleInfoWithPartsDataAsCsv(vehicleInfoWithPartsData);

      // assert
      ok(mockLogger.info.calledWith("[ScraperRepository.saveVehicleInfoWithPartsDataAsCsv] completed with a [Failure]."));
      ok(mockLogger.warn.calledWith(FS_WRITE_FILE_SYNC_VEHICLE_INFO_WITH_PART_NUMBERS_FAILURE_MESSAGE));
      ok(mockLogger.error.calledWith(err));
      deepEqual(result, new Left(expectedFailure));
    });

    it("should return [Right<true>] if everything ran correctly", async () => {
      // arrange
      getScraperConfigStub.returns(new Right(scraperConfig));
      writeFileSyncStub.returns(null);

      // act
      const result = repository.saveVehicleInfoWithPartsDataAsCsv(vehicleInfoWithPartsData);

      // assert
      deepEqual(result, new Right(true));
    });

    afterEach(() => {
      clock.restore();
    });

    afterAll(() => {
      getScraperConfigStub.restore();
    });
  });

  describe("setScraperConfig", () => {
    let scraperConfig: ScraperConfig;

    beforeAll(() => {
      scraperConfig = {
        partsCheckCredentials: {
          username: "test-username",
          password: "test-password",
        },
        savePath: "test-path",
      };
    });

    beforeEach(() => {
      mockLogger.info.resetHistory();
      mockLogger.warn.resetHistory();
      mockLogger.error.resetHistory();
      mockLocalDataSource.setScraperConfig.resetHistory();
    });

    it("should call [Logger.info] correctly", () => {
      // arrange
      mockLocalDataSource.setScraperConfig.returns(true);

      // act
      repository.setScraperConfig(scraperConfig);

      // assert
      ok(mockLogger.info.calledWith("[ScraperRepository.setScraperConfig] started."));
      ok(mockLogger.info.calledWith("[ScraperRepository.setScraperConfig] completed."));
      equal(mockLogger.info.callCount, 2);
    });

    it("should call [localDataSource.setScraperConfig] with correct params", () => {
      // arrange
      mockLocalDataSource.setScraperConfig.returns(true);

      // act
      repository.setScraperConfig(scraperConfig);

      // assert
      ok(mockLocalDataSource.setScraperConfig.calledOnceWith(scraperConfig));
    });

    it("should return [Failure] if [localDataSource.setScraperConfig throws", () => {
      // arrange
      const err = new Error("test-err");
      mockLocalDataSource.setScraperConfig.throws(err);

      const expectedFailure = new ScraperFailure(SCRAPER_LOCAL_DATA_SOURCE_SET_SCRAPER_CONFIG_FAILURE_MESSAGE, err);

      // act
      const result = repository.setScraperConfig(scraperConfig);

      // assert
      ok(mockLogger.info.calledWith("[ScraperRepository.setScraperConfig] completed with a [Failure]."));
      ok(mockLogger.warn.calledWith(SCRAPER_LOCAL_DATA_SOURCE_SET_SCRAPER_CONFIG_FAILURE_MESSAGE));
      ok(mockLogger.error.calledWith(err));
      deepEqual(result, new Left(expectedFailure));
    });

    it("should return [Right<true>] if everything ran without an issue", () => {
      // arrange
      mockLocalDataSource.setScraperConfig.returns(true);

      // act
      const result = repository.setScraperConfig(scraperConfig);

      // assert
      deepEqual(result, new Right(true));
    });
  });

  describe("getScraperConfig", () => {
    let scraperConfig: ScraperConfig;

    beforeAll(() => {
      scraperConfig = {
        partsCheckCredentials: {
          username: "test-username",
          password: "test-password",
        },
        savePath: "test-path",
      };
    });

    beforeEach(() => {
      mockLogger.info.resetHistory();
      mockLogger.warn.resetHistory();
      mockLogger.error.resetHistory();
      mockLocalDataSource.getScraperConfig.resetHistory();
    });

    it("should call [Logger.info] correctly", () => {
      // arrange
      mockLocalDataSource.getScraperConfig.returns(scraperConfig);

      // act
      repository.getScraperConfig();

      // assert
      ok(mockLogger.info.calledWith("[ScraperRepository.getScraperConfig] started."));
      ok(mockLogger.info.calledWith("[ScraperRepository.getScraperConfig] completed."));
      equal(mockLogger.info.callCount, 2);
    });

    it("should call [localDataSource.getScraperConfig] with correct params", () => {
      // arrange
      mockLocalDataSource.getScraperConfig.returns(scraperConfig);

      // act
      repository.getScraperConfig();

      // assert
      ok(mockLocalDataSource.getScraperConfig.calledOnceWith());
    });

    it("should return [Failure] if [localDataSource.getScraperConfig] throws", () => {
      // arrange
      const err = new Error("test-err");
      mockLocalDataSource.getScraperConfig.throws(err);

      const expectedFailure = new ScraperFailure(SCRAPER_LOCAL_DATA_SOURCE_GET_SCRAPER_CONFIG_FAILURE_MESSAGE, err);

      // act
      const result = repository.getScraperConfig();

      // assert
      ok(mockLogger.info.calledWith("[ScraperRepository.getScraperConfig] completed with a [Failure]."));
      ok(mockLogger.warn.calledWith(SCRAPER_LOCAL_DATA_SOURCE_GET_SCRAPER_CONFIG_FAILURE_MESSAGE));
      ok(mockLogger.error.calledWith(err));
      deepEqual(result, new Left(expectedFailure));
    });

    it("should return [Right<ScraperConfig>] if everything ran without an issue", () => {
      // arrange
      mockLocalDataSource.getScraperConfig.returns(scraperConfig);

      // act
      const result = repository.getScraperConfig();

      // assert
      deepEqual(result, new Right(scraperConfig));
    });
  });
});
