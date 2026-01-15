import json

# games_cleaned.json を読み込み
with open('games_cleaned.json', 'r', encoding='utf-8') as f:
    games = json.load(f)

# games.json に実際に使われているジャンルを集計
all_genres = set()
for game in games:
    if 'genres' in game:
        game_genres = game['genres']
        # 文字列の場合、カンマで分割
        if isinstance(game_genres, str):
            genre_list = [g.strip() for g in game_genres.split(',')]
            all_genres.update(genre_list)
        # リストの場合、そのまま追加
        elif isinstance(game_genres, list):
            all_genres.update(game_genres)

# アルファベット順にソート
sorted_genres = sorted(list(all_genres))

print(f"✅ games.json に含まれるジャンル総数: {len(sorted_genres)}\n")
print("全ジャンル一覧:")
for i, genre in enumerate(sorted_genres, 1):
    print(f"{i:2d}. {genre}")

# genres.json に含まれないジャンルを確認
with open('genres.json', 'r', encoding='utf-8') as f:
    current_genres = set(json.load(f))

missing_genres = all_genres - current_genres
if missing_genres:
    print(f"\n⚠️ genres.json に含まれていないジャンル ({len(missing_genres)}個):")
    for genre in sorted(missing_genres):
        print(f"  - {genre}")
else:
    print("\n✅ genres.json は全ジャンルを網羅しています！")

# 更新用の新しい genres.json を作成
new_genres = sorted_genres
with open('genres.json', 'w', encoding='utf-8') as f:
    json.dump(new_genres, f, indent=2, ensure_ascii=False)

print(f"\n✅ genres.json を更新しました！({len(new_genres)}個のジャンル)")