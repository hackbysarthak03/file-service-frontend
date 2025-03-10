import { Route, Routes, BrowserRouter } from "react-router-dom";
import AdminPanel from "./AdminPanel/AdminPanel";
import AuthPage from "./AdminPanel/AuthPage";
import UserPanel from "./UserPanel/UserPanel";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin">
          <Route path="login" element={<AuthPage />} />
          <Route path="dashboard" element={<AdminPanel />} />
        </Route>
        <Route path="/" element={<UserPanel />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;