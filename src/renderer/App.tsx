import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout/Layout";
import ConfigView from "./views/Config/ConfigView";
import DashboardView from "./views/Dashboard/DashboardView";
import SettingsView from "./views/Settings/SettingsView";
import { ReactNotifications } from "react-notifications-component";
import "react-notifications-component/dist/theme.css";
import ScraperView from "./views/Scraper/ScraperView";

export default function App() {
  return (
    <>
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
    </>
  );
}
