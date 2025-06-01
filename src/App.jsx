import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://rumadev-btd6cttilemanagesystem.hf.space/api/tiles";

export default function App() {
  const [tiles, setTiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(API_URL)
      .then((res) => {
        const parsedTiles = Object.entries(res.data).map(([name, raw]) => {
          let info = {};
          try {
            info = JSON.parse(raw);
          } catch {
            info = { status: "형식오류", player: "N/A" };
          }
          return { name, ...info };
        });
        setTiles(parsedTiles);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-xl font-bold">
        불러오는 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-600 text-xl font-bold">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-extrabold mb-8 text-center text-blue-700">
        BTD6 영토 전쟁 타일 점령 현황
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {tiles.map((tile) => (
          <TileCard key={tile.name} tile={tile} />
        ))}
      </div>
    </div>
  );
}

// 상태별 뱃지 색상 함수
function getColorByStatus(status) {
  switch (status) {
    case "예약중":
      return "bg-yellow-200 text-yellow-800 border-yellow-400";
    case "시작중":
      return "bg-blue-200 text-blue-800 border-blue-400";
    case "완료":
      return "bg-green-200 text-green-800 border-green-400";
    default:
      return "bg-gray-200 text-gray-800 border-gray-300";
  }
}

function TileCard({ tile }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 flex flex-col items-center hover:scale-105 transition-transform duration-200">
      <div className="text-lg font-bold mb-1">{tile.name}</div>
      <div
        className={`text-sm mb-2 px-3 py-1 rounded-full border ${getColorByStatus(
          tile.status
        )}`}
      >
        {tile.status}
      </div>
      <div className="text-xs text-gray-400">플레이어: {tile.player}</div>
      <br />
    </div>
  );
}
