import "./ConfigView.css";
import { useState } from "react";
import { ipcRenderer } from "electron";

function ConfigView() {
  const browse = async () => {
    // const pathResult = await ipcRenderer.invoke("dialog:openDirectory");

    console.log(ipcRenderer.send("usecase:getScraperConfig"));
  };

  const [partsCheckUsername, setPartsCheckUsername] = useState<string>();
  const [partsCheckPassword, setPartsCheckPassword] = useState<string>();

  return (
    <>
      <section className="config-wrapper">
        <div className="inp-container">
          <label htmlFor="partsCheckUsername">partscheck.com.au username</label>
          <input
            id="partsCheckUsername"
            className="inp-default"
            type="text"
            onChange={(e) => setPartsCheckUsername(e.target.value)}
          />
        </div>
        <div className="inp-container">
          <label htmlFor="partsCheckPassword">partscheck.com.au password</label>
          <input
            id="partsCheckPassword"
            className="inp-default"
            type="text"
            onChange={(e) => setPartsCheckPassword(e.target.value)}
          />
        </div>
        <div className="inp-container">
          <label htmlFor="partsCheckPassword">Save Directory</label>
          <div>
            <button onClick={browse}>Browse</button>
          </div>
        </div>
        <div style={{ flex: 1 }}></div>
        <button className="btn-default config-save-btn">SAVE</button>
      </section>
    </>
  );
}

export default ConfigView;
