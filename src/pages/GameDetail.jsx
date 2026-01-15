import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function GameDetail() {
  const { appid } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [header, setHeader] = useState(null);
  const [wordclouds, setWordclouds] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [tfidfData, setTfidfData] = useState(null);
  const [displayCount, setDisplayCount] = useState(5);
  const [loading, setLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState(null);
  const [filterType, setFilterType] = useState("all"); // 'all', 'recommended', 'not_recommended'
  const [sortBy, setSortBy] = useState("newest"); // 'newest', 'recommended', 'not_recommended'

  useEffect(() => {
    Promise.all([
      fetch("/data/games.json").then((r) => r.json()),
      fetch("/data/headers.json").then((r) => r.json()),
      fetch("/data/wordclouds.json").then((r) => r.json()),
      fetch(`/data/reviews/${appid}.json`)
        .then((r) => r.json())
        .catch(() => []),
      fetch("/data/tfidf_results.json")
        .then((r) => r.json())
        .catch(() => null),
    ]).then(([games, headers, wordclouds, reviewsData, tfidfData]) => {
      const foundGame = games.find((g) => g.appid.toString() === appid);
      setGame(foundGame);
      setHeader(headers[appid]);
      setWordclouds(wordclouds[appid]);

      // レビューデータを統合（新旧形式に対応）
      let allReviews = [];
      if (reviewsData.positive && reviewsData.negative) {
        // 新形式：{ positive: [...], negative: [...] }
        allReviews = [
          ...reviewsData.positive,
          ...reviewsData.negative,
        ];
      } else if (Array.isArray(reviewsData)) {
        // 旧形式：直接配列
        allReviews = reviewsData;
      }

      setReviews(allReviews);
      setTfidfData(tfidfData?.[appid]);
      setLoading(false);
    });
  }, [appid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <button
          onClick={() => navigate("/")}
          className="mb-6 px-4 py-2 bg-blue-600 text-blue rounded-lg hover:bg-blue-700"
        >
          ← トップに戻る
        </button>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">ゲームが見つかりません</p>
        </div>
      </div>
    );
  }

  // 単語でレビューをフィルタリング
  let filteredReviews = reviews;
  if (selectedWord) {
    const wordLower = selectedWord.toLowerCase();
    filteredReviews = reviews.filter((review) =>
      review.review.toLowerCase().includes(wordLower)
    );
  }

  // 推奨/非推奨でフィルタリング
  if (filterType !== "all") {
    const isRecommended = filterType === "recommended";
    filteredReviews = filteredReviews.filter(
      (review) => review.voted_up === isRecommended
    );
  }

  const visibleReviews = filteredReviews.slice(0, displayCount);
  const hasMore = displayCount < filteredReviews.length;

  // ソート機能
  const sortedReviews = [...filteredReviews];
  if (sortBy === "recommended") {
    sortedReviews.sort((a, b) => b.voted_up - a.voted_up); // ✅を先に
  } else if (sortBy === "not_recommended") {
    sortedReviews.sort((a, b) => a.voted_up - b.voted_up); // ❌を先に
  }

  const displayedReviews = sortedReviews.slice(0, displayCount);

  // TF-IDF から単語リストを取得
  const recommendedWords = tfidfData?.recommended || [];
  const notRecommendedWords = tfidfData?.not_recommended || [];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* ヘッダー */}
      <header className="bg-gray-900 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="text-2xl hover:text-gray-300 transition"
          >
            ←
          </button>
          <h1 className="text-3xl font-bold">{game.name}</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* ゲーム情報 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          {header && (
            <img src={header} className="w-full h-64 object-cover" />
          )}
          <div className="p-6">
            <p className="text-lg font-semibold mb-2">
              価格: <span className="text-green-600 text-xl">{game.price || "無料"}</span>
            </p>
            <p className="text-sm text-gray-600">
              ジャンル: {Array.isArray(game.genres) ? game.genres.join(", ") : game.genres}
            </p>
          </div>
        </div>

        {/* ワードクラウド */}
        {wordclouds && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">レビュー分析</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {wordclouds.positive && (
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-green-700 mb-3">
                    ポジティブキーワード
                  </h3>
                  <img src={wordclouds.positive} className="rounded-lg w-full" />
                </div>
              )}
              {wordclouds.negative && (
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-red-700 mb-3">
                    ネガティブキーワード
                  </h3>
                  <img src={wordclouds.negative} className="rounded-lg w-full" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* 単語フィルター */}
        {tfidfData && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">単語でレビューを検索</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ポジティブ単語 */}
              <div>
                <h3 className="text-lg font-semibold text-green-700 mb-3">
                  ポジティブキーワード
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recommendedWords.map((item) => (
                    <button
                      key={item.word}
                      onClick={() => {
                        setSelectedWord(
                          selectedWord === item.word ? null : item.word
                        );
                        setDisplayCount(5);
                        setFilterType("recommended");
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                        selectedWord === item.word
                          ? "bg-green-600 text-white"
                          : "bg-green-100 text-green-800 hover:bg-green-200"
                      }`}
                    >
                      {item.word}
                    </button>
                  ))}
                </div>
              </div>

              {/* ネガティブ単語 */}
              <div>
                <h3 className="text-lg font-semibold text-red-700 mb-3">
                  ネガティブキーワード
                </h3>
                <div className="flex flex-wrap gap-2">
                  {notRecommendedWords.map((item) => (
                    <button
                      key={item.word}
                      onClick={() => {
                        setSelectedWord(
                          selectedWord === item.word ? null : item.word
                        );
                        setDisplayCount(5);
                        setFilterType("not_recommended");
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                        selectedWord === item.word
                          ? "bg-red-600 text-white"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                    >
                      {item.word}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* リセットボタン */}
            {selectedWord && (
              <button
                onClick={() => {
                  setSelectedWord(null);
                  setFilterType("all");
                  setDisplayCount(5);
                }}
                className="mt-4 px-4 py-2 bg-gray-400 text-blue rounded-lg hover:bg-gray-500 font-semibold"
              >
                フィルターをリセット
              </button>
            )}
          </div>
        )}

        {/* レビューセクション */}
        {reviews.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">
                レビュー ({filteredReviews.length}/{reviews.length}件)
                {selectedWord && <span className="text-sm text-gray-600 ml-2">「{selectedWord}」を含む</span>}
              </h2>
            </div>

            {/* ソートボタン */}
            <div className="mb-4 flex gap-2 flex-wrap">
              <button
                onClick={() => setSortBy("recommended")}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  sortBy === "recommended"
                    ? "bg-green-600 text-blue"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                👍 推奨
              </button>
              <button
                onClick={() => setSortBy("not_recommended")}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  sortBy === "not_recommended"
                    ? "bg-red-600 text-blue"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                👎 非推奨
              </button>
            </div>

            <div className="space-y-4">
              {displayedReviews.map((review, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    review.voted_up
                      ? "bg-green-50 border-green-500"
                      : "bg-red-50 border-red-500"
                  }`}
                >
                  {/* ヘッダー */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-sm font-semibold px-3 py-1 rounded-full ${
                        review.voted_up
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {review.voted_up ? "👍 推奨" : "👎 非推奨"}
                    </span>

                    {/* 役立ち投票数 */}
                    {review.votes_helpful !== undefined && (
                      <span className="text-xs text-gray-500">
                        👍 {review.votes_helpful}人が役立つと評価
                      </span>
                    )}
                  </div>

                  {/* レビューテキスト */}
                  {review.review && (
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {selectedWord
                        ? review.review.split(new RegExp(`(${selectedWord})`, "gi")).map((part, i) =>
                            part.toLowerCase() === selectedWord.toLowerCase() ? (
                              <mark key={i} className="bg-yellow-300 font-bold">
                                {part}
                              </mark>
                            ) : (
                              part
                            )
                          )
                        : review.review}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* もっと見るボタン */}
            {displayCount < filteredReviews.length && (
              <button
                onClick={() => setDisplayCount((prev) => prev + 5)}
                className="w-full mt-6 px-4 py-3 bg-indigo-600 text-blue rounded-lg hover:bg-indigo-700 font-semibold transition"
              >
                もっと見る ({displayedReviews.length}/{filteredReviews.length})
              </button>
            )}

            {displayCount >= filteredReviews.length && filteredReviews.length > 5 && (
              <button
                onClick={() => setDisplayCount(5)}
                className="w-full mt-6 px-4 py-3 bg-purple-600 text-blue rounded-lg hover:bg-slate-600 font-semibold transition"
              >
                閉じる
              </button>
            )}
          </div>
        )}

        {reviews.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">レビューはまだ登録されていません</p>
          </div>
        )}
      </div>
    </div>
  );
}