import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [games, setGames] = useState([]);
  const [headers, setHeaders] = useState({});
  const [wordclouds, setWordclouds] = useState({});
  const [genres, setGenres] = useState([]);

  const navigate = useNavigate();

  // フィルター状態
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState("none");

  useEffect(() => {
    Promise.all([
      fetch("/data/games.json").then((r) => r.json()),
      fetch("/data/headers.json").then((r) => r.json()),
      fetch("/data/wordclouds.json").then((r) => r.json()),
      fetch("/data/genres.json").then((r) => r.json()),
    ]).then(([g, h, w, ge]) => {
      setGames(g);
      setHeaders(h);
      setWordclouds(w);
      setGenres(ge);
    });
  }, []);

  const parsePrice = (price) => {
    if (!price) return 0;
    return Number(price.replace(/[^\d]/g, ""));
  };

  let filtered = games.filter((game) => {
    const price = parsePrice(game.price);

    if (minPrice !== "" && price < Number(minPrice)) return false;
    if (maxPrice !== "" && price > Number(maxPrice)) return false;

    if (selectedGenres.length > 0) {
      let gameGenres = [];
      if (Array.isArray(game.genres)) {
        gameGenres = game.genres;
      } else if (typeof game.genres === "string") {
        gameGenres = game.genres.split(",").map((g) => g.trim());
      }
      
      if (!selectedGenres.some((s) => gameGenres.includes(s))) return false;
    }

    return true;
  });

  if (sortBy === "price-asc") {
    filtered = [...filtered].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
  } else if (sortBy === "price-desc") {
    filtered = [...filtered].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* ヘッダー */}
      <header className="bg-gray-900 text-white p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-center">
          🎮 Steam Top Games Dashboard
        </h1>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* フィルターUI */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">フィルター・ソート</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 最低価格 */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                最低価格 (¥)
              </label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 最高価格 */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                最高価格 (¥)
              </label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="10000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* ジャンルドロップダウン */}
            <div className="relative">
              <label className="block text-sm font-semibold mb-2">ジャンル</label>
              <button
                onClick={() => setGenreDropdownOpen(!genreDropdownOpen)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left flex justify-between items-center hover:bg-gray-50"
              >
                <span className="text-sm">
                  {selectedGenres.length === 0
                    ? "選択してください"
                    : `${selectedGenres.length}個選択`}
                </span>
                <span
                  className={`transition ${
                    genreDropdownOpen ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              {genreDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {genres.map((genre) => (
                    <label
                      key={genre}
                      className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={selectedGenres.includes(genre)}
                        onChange={(e) => {
                          e.stopPropagation();
                          setSelectedGenres((prev) =>
                            prev.includes(genre)
                              ? prev.filter((g) => g !== genre)
                              : [...prev, genre]
                          );
                        }}
                        className="mr-2"
                        onClick={(e) => e.stopPropagation()}
                      />
                      {genre}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* ソート */}
            <div>
              <label className="block text-sm font-semibold mb-2">ソート</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">ソートなし</option>
                <option value="price-asc">価格: 安い順</option>
                <option value="price-desc">価格: 高い順</option>
              </select>
            </div>
          </div>

          {/* 選択中のジャンル表示 */}
          {selectedGenres.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedGenres.map((genre) => (
                <span
                  key={genre}
                  className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {genre}
                  <button
                    onClick={() =>
                      setSelectedGenres((prev) =>
                        prev.filter((g) => g !== genre)
                      )
                    }
                    className="hover:text-blue-600"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ゲーム一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((game, index) => {
            const appid = game.appid.toString();
            const header = headers[appid];
            const uniqueKey = `${appid}-${index}`;

            return (
              <div
                key={uniqueKey}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer"
                onClick={() => navigate(`/game/${appid}`)}
              >
                {/* ヘッダー画像 */}
                {header ? (
                  <img src={header} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-600">No image</span>
                  </div>
                )}

                <div className="p-4">
                  <h2 className="text-lg font-bold">{game.name}</h2>
                  <p className="text-sm text-gray-600 mb-2">
                    {Array.isArray(game.genres) ? game.genres.join(", ") : game.genres}
                  </p>
                  <p className="text-sm font-semibold text-green-600">
                    {game.price ? game.price : "無料"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}