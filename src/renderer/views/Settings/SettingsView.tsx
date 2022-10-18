import { useContext } from "react";
import { Types } from "../../store/reducers";
import { AppContext } from "../../store/context";
import "./SettingsView.css";

function SettingsView() {
  const { state, dispatch } = useContext(AppContext);

  return (
    <>
      <section className="settings-wrapper">
        <button
          onClick={() => {
            dispatch({
              type: Types.setLoading,
              payload: !state.isScraping,
            });
            console.log(state);
          }}
        ></button>
      </section>
    </>
  );
}

export default SettingsView;
