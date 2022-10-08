import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout/Layout";
import DashboardView from "./views/Dashboard/DashboardView";

export default function App() {
  return (
    <Layout>
      <Router>
        <Routes>
          <Route path="/" element={<DashboardView />} />
        </Routes>
      </Router>
    </Layout>
  );
}
