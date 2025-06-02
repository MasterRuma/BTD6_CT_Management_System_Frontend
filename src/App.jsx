import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function App() {
  const [tiles, setTiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const { playerId } = useParams();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const url = import.meta.env.VITE_API_URL;
        const res = await axios.get(url);

        const rawTiles = Object.entries(res.data).map(([name, raw]) => {
          let info = {};
          try {
            const sanitizedRaw = raw.replace(/"player":\s*(\d+)/, '"player":"$1"');
            info = JSON.parse(sanitizedRaw);
            info.player = String(info.player);
          } catch {
            info = { status: "형식오류", player: "N/A" };
          }
          return { name, ...info };
        });

        const filteredTiles = playerId
          ? rawTiles.filter((tile) => String(tile.player) === String(playerId))
          : rawTiles;

        setTiles(filteredTiles);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [playerId]);

  const groupedTiles = useMemo(() => {
    return {
      예약중: tiles.filter((tile) => tile.status === "예약중"),
      시작중: tiles.filter((tile) => tile.status === "시작중"),
      완료: tiles.filter((tile) => tile.status === "완료"),
    };
  }, [tiles]);

  const displayedTiles =
    filter === "all" ? tiles : tiles.filter((tile) => tile.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-2xl font-bold text-white bg-gradient-to-br from-blue-600 to-purple-600">
        불러오는 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500 text-2xl font-bold bg-gradient-to-br from-blue-600 to-purple-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 bg-dot-pattern p-8">
      <h1 className="text-4xl font-extrabold mb-10 text-center text-indigo-900 drop-shadow-md">
        BTD6 영토 전쟁 타일 점령 현황
      </h1>

      {/* 필터 버튼 */}
      <div className="flex justify-center mb-8 space-x-4">
        {["all", "예약중", "시작중", "완료"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-lg font-semibold shadow-md transition-all duration-200 ${
              filter === f
                ? getFilterButtonStyle(f)
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {f === "all" ? "전체" : f} (
            {f === "all" ? tiles.length : groupedTiles[f]?.length || 0})
          </button>
        ))}
      </div>

      {/* 상태별 블록 */}
      {filter === "all" ? (
        <div className="space-y-12">
          {["예약중", "시작중", "완료"].map(
            (status) =>
              groupedTiles[status].length > 0 && (
                <div
                  key={status}
                  className="bg-white rounded-xl shadow-xl p-6 border-l-8"
                  style={{ borderColor: getSectionBorderColor(status) }}
                >
                  <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center space-x-2">
                    <span className={getColorByStatus(status).text}>
                      {getColorByStatus(status).icon}
                    </span>
                    <span>
                      {status} ({groupedTiles[status].length})
                    </span>
                  </h2>
                  <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {groupedTiles[status].map((tile) => (
                      <TileCard key={tile.name} tile={tile} />
                    ))}
                  </div>
                </div>
              )
          )}
        </div>
      ) : (
        <div
          className="bg-white rounded-xl shadow-xl p-6 border-l-8"
          style={{ borderColor: getSectionBorderColor(filter) }}
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center space-x-2">
            <span className={getColorByStatus(filter).text}>
              {getColorByStatus(filter).icon}
            </span>
            <span>
              {filter} ({displayedTiles.length})
            </span>
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {displayedTiles.map((tile) => (
              <TileCard key={tile.name} tile={tile} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getColorByStatus(status) {
  switch (status) {
    case "예약중":
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        border: "border-yellow-300",
        icon: "🕒",
      };
    case "시작중":
      return {
        bg: "bg-blue-100",
        text: "text-blue-800",
        border: "border-blue-300",
        icon: "▶️",
      };
    case "완료":
      return {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-300",
        icon: "✅",
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-800",
        border: "border-gray-300",
        icon: "❓",
      };
  }
}

function getSectionBorderColor(status) {
  switch (status) {
    case "예약중":
      return "#F59E0B"; // 진한 노란색
    case "시작중":
      return "#3B82F6"; // 진한 파란색
    case "완료":
      return "#10B981"; // 진한 초록색
    default:
      return "#6B7280"; // 회색
  }
}

function getFilterButtonStyle(filter) {
  switch (filter) {
    case "all":
      return "bg-indigo-600 text-white hover:bg-indigo-700";
    case "예약중":
      return "bg-yellow-500 text-white hover:bg-yellow-600";
    case "시작중":
      return "bg-blue-500 text-white hover:bg-blue-600";
    case "완료":
      return "bg-green-500 text-white hover:bg-green-600";
    default:
      return "bg-gray-200 text-gray-800 hover:bg-gray-300";
  }
}

function TileCard({ tile }) {
  const { bg, text, border, icon } = getColorByStatus(tile.status);

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-5 flex flex-col items-center hover:shadow-lg transition-all duration-200 ${border}`}
    >
      <div className="text-lg font-bold mb-2 text-gray-900">{tile.name}</div>
      <div
        className={`text-sm mb-3 px-4 py-1 rounded-full ${bg} ${text} font-semibold flex items-center space-x-2`}
      >
      </div>
      <div className="text-xs text-gray-500">플레이어: {tile.player}</div>
    </div>
  );
}