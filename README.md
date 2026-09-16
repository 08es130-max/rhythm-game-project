# ラブフェス！

PC・スマホ向けの9レーンリズムゲーム。ホーム、楽曲選択、判定調整、キャラ設定、勧誘に対応しています。

- [アプリを開く](https://08es130-max.github.io/rhythm-game-project/)
- [開発ガイド・保護する仕様](ARCHITECTURE.md)
- [依存関係と旧ファイルの監査](docs/AUDIT.md)

PCキーは左から `A S D F SPACE J K L ;`。音源は端末のファイルから選択します。開発時もfile URLではなくHTTPサーバー経由で起動してください。

譜面JSONの基本形:

```json
{
  "title": "Sample",
  "offsetMs": 0,
  "notes": [{ "timeMs": 1000, "lane": 4 }]
}
```

`timeMs`は音源先頭からのミリ秒、`lane`は0〜8。判定・補正の現行実装と注意点は開発ガイドを参照してください。
