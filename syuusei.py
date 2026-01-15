import json

# ファイル読み込み
with open('games_cleaned.json', 'r', encoding='utf-8') as f:
    games = json.load(f)

with open('genres.json', 'r', encoding='utf-8') as f:
    genres = json.load(f)

# games.json に実際に使われているジャンルを集計
used_genres = set()
for game in games:
    if 'genres' in game:
        game_genres = game['genres']
        # 文字列の場合、カンマで分割
        if isinstance(game_genres, str):
            game_genres = [g.strip() for g in game_genres.split(',')]
        # リストの場合、そのまま使用
        if isinstance(game_genres, list):
            used_genres.update(game_genres)

print(f"games.json に含まれるジャンル数: {len(used_genres)}")
print(f"genres.json のジャンル数: {len(genres)}")

# 使用されていないジャンルをフィルタリング
cleaned_genres = [g for g in genres if g in used_genres]

# アルファベット順にソート
cleaned_genres.sort()

print(f"クリーニング後: {len(cleaned_genres)}")
print(f"削除数: {len(genres) - len(cleaned_genres)}")

# 削除されたジャンルを表示
deleted_genres = [g for g in genres if g not in used_genres]
if deleted_genres:
    print("\n削除されたジャンル:")
    for g in sorted(deleted_genres)[:10]:  # 最初の10個を表示
        print(f"  - {g}")
    if len(deleted_genres) > 10:
        print(f"  ... 他 {len(deleted_genres) - 10} 個")

# ファイルに保存
with open('genres.json', 'w', encoding='utf-8') as f:
    json.dump(cleaned_genres, f, indent=2, ensure_ascii=False)

print("\n✅ genres.json を更新しました！")