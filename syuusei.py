import json

# タグの対応表（小文字アンダースコア → 正しい形式）
tag_mapping = {
    "game_mechanics": "Game Mechanics",
    "game_balance": "Game Balance",
    "music": "Music",
    "story": "Story",
    "immersion": "Immersion",
    "user_interface": "User Interface",
    "usability": "Usability",
    "graphics": "Graphics",
    "community": "Community",
    "dlc": "DLC",
    "mods": "Mods",
    "content_volume": "Content Volume",
    "player_skill": "Player Skill",
}

# game_tags.json を読み込み
with open('game_tags.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 配列の場合、オブジェクトに変換しながらタグ名を修正
if isinstance(data, list):
    converted_data = {}
    for item in data:
        if 'appid' not in item:
            continue
        
        appid = str(item['appid'])
        
        # タグ名を正しい形式に変換
        if 'tags' in item:
            item['tags'] = [
                tag_mapping.get(tag.lower(), tag) 
                for tag in item['tags']
            ]
        
        # scores キーも同じように変換
        if 'scores' in item:
            new_scores = {}
            for key, value in item['scores'].items():
                new_key = tag_mapping.get(key.lower(), key)
                new_scores[new_key] = value
            item['scores'] = new_scores
        
        converted_data[appid] = item
    
    data = converted_data
else:
    # オブジェクトの場合
    for appid in data:
        if 'tags' in data[appid]:
            data[appid]['tags'] = [
                tag_mapping.get(tag.lower(), tag) 
                for tag in data[appid]['tags']
            ]
        if 'scores' in data[appid]:
            new_scores = {}
            for key, value in data[appid]['scores'].items():
                new_key = tag_mapping.get(key.lower(), key)
                new_scores[new_key] = value
            data[appid]['scores'] = new_scores

# 修正後のファイルを保存
with open('game_tags.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print('✅ game_tags.json のタグ名を修正しました！')
print('変換内容:')
for small, correct in tag_mapping.items():
    print(f'  {small} → {correct}')