import { useContext } from "react";
import { ipcRenderer } from "electron";
import "./ScraperView.css";
import { Link } from "react-router-dom";
import { Store } from "react-notifications-component";
import { AppContext } from "../../store/context";
import { Types } from "../../store/reducers";

function ScraperView() {
  const { state, dispatch } = useContext(AppContext);
  const { scraperConfig, isScraping, quoteUrl } = state;

  const scrape = async () => {
    if (quoteUrl) {
      dispatch({
        type: Types.setIsScraping,
        payload: true,
      });

      ipcRenderer
        .invoke("usecase:scrapePartNumbers", quoteUrl)
        .then((res) => {
          if (res)
            Store.addNotification({
              title: "Successful Scrape",
              message: `Data is saved to specified path in config (${scraperConfig?.savePath}).`,
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
          else
            Store.addNotification({
              title: "Error",
              message: `An error occurred while scraping, you can view the error log in logs directory`,
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

          dispatch({
            type: Types.setIsScraping,
            payload: false,
          });
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

          dispatch({
            type: Types.setIsScraping,
            payload: false,
          });
        });
    }
  };

  if (
    !(
      scraperConfig &&
      scraperConfig?.savePath &&
      scraperConfig?.partsCheckCredentials
    )
  ) {
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
            onChange={(e) =>
              dispatch({
                type: Types.setQuoteUrl,
                payload: e.target.value,
              })
            }
            defaultValue={quoteUrl}
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
