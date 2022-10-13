import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout/Layout";
import ConfigView from "./views/Config/ConfigView";
import DashboardView from "./views/Dashboard/DashboardView";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/config" element={<ConfigView />} />
        </Routes>
      </Layout>
    </Router>
  );
}
