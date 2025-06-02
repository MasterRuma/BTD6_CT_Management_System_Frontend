import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} /> {/* 전체조회 */}
        <Route path="/:playerId" element={<App />} /> {/* 특정 playerId 조회 */}{/* 에러 해결용 */}
      </Routes>
    </BrowserRouter> 
  );
}
