import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout/Layout";
import ConfigView from "./views/Config/ConfigView";
import DashboardView from "./views/Dashboard/DashboardView";
import SettingsView from "./views/Settings/SettingsView";
import { ReactNotifications } from "react-notifications-component";
import "react-notifications-component/dist/theme.css";
import ScraperView from "./views/Scraper/ScraperView";
import { useReducer } from "react";
import appReducer from "./store/reducers";
import { AppContext, appInitialState } from "./store/context";

const AppProvider = ({
  children,
}: {
  children: JSX.Element[] | JSX.Element;
}) => {
  const [state, dispatch] = useReducer(appReducer, appInitialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export default function App() {
  return (
    <AppProvider>
      <ReactNotifications />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardView />} />
            <Route path="/scraper" element={<ScraperView />} />
            <Route path="/config" element={<ConfigView />} />
            <Route path="/settings" element={<SettingsView />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}
