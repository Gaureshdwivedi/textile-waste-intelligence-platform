import { Routes, Route } from "react-router-dom";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import History from "./pages/History";
import HistoryDetails from "./pages/HistoryDetails";

function App() {
  return (
    <Routes>

      <Route path="/" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="/upload" element={<Upload />} />

      <Route path="/history" element={<History />} />
      
      <Route path="/history/:id" element={<HistoryDetails />}/>

      <Route path="/profile" element={<Profile />} />

    </Routes>
  );
}

export default App;