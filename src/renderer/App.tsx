import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout/Layout";
import ConfigView from "./views/Config/ConfigView";
import DashboardView from "./views/Dashboard/DashboardView";
import SettingsView from "./views/Settings/SettingsView";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/config" element={<ConfigView />} />
          <Route path="/settings" element={<SettingsView />} />
        </Routes>
      </Layout>
    </Router>
  );
}
