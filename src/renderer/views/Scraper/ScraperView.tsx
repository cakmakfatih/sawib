import ScraperConfig from "../../../main/features/scraper/domain/entities/ScraperConfig";
import { useState, useEffect } from "react";
import { ipcRenderer } from "electron";
import "./ScraperView.css";
import { Link } from "react-router-dom";
import { Store } from "react-notifications-component";

function ScraperView() {
  const [scraperConfig, setScraperConfig] = useState<ScraperConfig | null>(
    null
  );

  const [quoteUrl, setquoteUrl] = useState<string>("");
  const [isScraping, setIsScraping] = useState<boolean>(false);

  useEffect(() => {
    const config: ScraperConfig = ipcRenderer.sendSync(
      "usecase:getScraperConfig"
    );

    setScraperConfig(config);
  }, []);

  const scrape = async () => {
    if (quoteUrl) {
      setIsScraping(true);

      ipcRenderer
        .invoke("usecase:scrapePartNumbers", quoteUrl)
        .then(() => {
          Store.addNotification({
            title: "Successful Scrape",
            message: `Data is saved to specified path in config (${scraperConfig?.partNumberSavePath}).`,
            type: "success",
            insert: "top",
            container: "top-right",
            animationIn: ["animate__animated", "animate__fadeIn"],
            animationOut: ["animate__animated", "animate__fadeOut"],
            dismiss: {
              duration: 5000,
              onScreen: true,
            },
          });

          setIsScraping(false);
        })
        .catch((err) => {
          Store.addNotification({
            title: "Error",
            message: `An error occurred while scraping: ${err}`,
            type: "danger",
            insert: "top",
            container: "top-right",
            animationIn: ["animate__animated", "animate__fadeIn"],
            animationOut: ["animate__animated", "animate__fadeOut"],
            dismiss: {
              duration: 5000,
              onScreen: true,
            },
          });

          setIsScraping(false);
        });
    }
  };

  if (scraperConfig === null) {
    return (
      <>
        <section className="scraper-wrapper">
          <div className="warning">
            <p>
              No config detected. You need to navigate to [Config] page and set
              config before running the scrape operations.
            </p>
            <div>
              <p>
                To go to the [Config] page, you can click on{" "}
                <Link to="/config">here</Link>
              </p>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="scraper-wrapper">
        <div className="inp-container">
          <label htmlFor="scrapeOperation">Operation</label>
          <select id="scrapeOperation" className="inp-default select-default">
            <option>Scrape Part Numbers</option>
          </select>
        </div>
        <div className="inp-container">
          <label htmlFor="partsCheckQuoteUrl">
            partscheck.com.au Quote URL
          </label>
          <input
            onChange={(e) => setquoteUrl(e.target.value)}
            id="partsCheckQuoteUrl"
            className="inp-default"
            type="text"
          />
        </div>
        <div style={{ flex: 1 }}></div>
        <button
          onClick={scrape}
          className="btn-default scrape-btn"
          disabled={isScraping}
        >
          {isScraping && (
            <div className="lds-ring">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          )}
          {isScraping && <div style={{ width: 10 }} />}
          <span>SCRAPE</span>
        </button>
      </section>
    </>
  );
}

export default ScraperView;
