# ラブフェス！開発ガイド

9レーンの静的ブラウザゲーム。PCキーとスマホタッチに対応し、ホーム、楽曲選択、設定、判定調整、部室、勧誘、隠し管理人モードを持つ。楽曲音源は端末から選び、IndexedDBに保存する。公式バージョンは `index.html` の `APP_VERSION` と `version.json` の **0.8.20**。

## 最初に読むファイル

|領域|主要ファイルと役割|
|---|---|
|起動|`index.html` が順序付きclassic scriptを読み込む。ES modulesではない|
|ゲーム|`app.js` が状態・DOM・判定定数。`settings.js` が保存設定。`pause.js` が停止/再開|
|最終実装|時計=`smooth-clock-v072.js`、描画=`canvas-notes-v073.js`、入力=`input-fix-v077.js`、HUD集約=`runtime-tuning-v074.js`|
|音声|`tap-boost.js` が音源、`tap-sound-fix-v068.js` が最終シャン音。`voice-manager.js` が端末ボイス管理、`voice-direct.js` が端末再生、`voice-independent-v040.js` が内蔵6音声再生|
|ホーム|`home.js` が画面遷移・保存、`home-layout-v042.js` がメニューとお知らせ、`home-result-v049.js` が会話と結果連動|
|楽曲|`song-presets.js` が譜面/音源保存。`fixes-v051.js` が楽曲一覧と追加画面。`songs-v075.js` がカード、`songs-v077.js` が最終追加譜面。`song-select-v082.js` がカルーセル|
|キャラクター|`character-data.js`→overrides→`character-fixes-v037.js`。ID・データを順に補正。`gacha-data-v045.js` が所有データ、`gacha-v045.js` が10連演出|
|UR画像|`fixes-v051.js` のMONTHLY_META、部室/判定円のcrop、追加/再利用されたガチャDOMへの画像補正|
|管理人|`hidden-admin-v048.js`。`shioriko-secret-modes-v050.js` がモード選択と会話を追加|
|結果|`home-result-v049.js` と、voice-independentから動的ロードされる `result-enhancements-v041.js`。両方現役|

全script/CSS/旧ファイル/workflowの判定根拠は [監査記録](docs/AUDIT.md)。ファイル名の数字は現役かどうかを表さない。まずこの表と `index.html` を読み、対象機能のファイルだけを追う。

## 変更禁止の仕様

- 左から9レーン、`A S D F SPACE J K L ;`。
- PERFECT ±45ms、GREAT ±85ms、GOOD ±150ms。判定強化ONの仕様はPERFECT ±70ms。
- シャン音、右下ポーズ、pointer/touchのiPhone・Android互換処理を維持。時計、入力timestamp補正、判定方式を軽量化目的で変更しない。
- `home-layering-v0814.css` は承認済み配置。横向き立ち絵 `width:122% / height:132% / bottom:-46px`、高さ620px以下 `124% / 134% / -50px`。位置、拡大率、頭位置、足の見切れ方を変えない。
- 画像、アイコン、音源、譜面、キャラ/ガチャ/会話データを明示許可なしに変更・再圧縮・削除しない。

## ホームと栞子

夜空・星・透過・ロゴ・立ち絵のCSSは別の役割を持ち、順序と!importantもレイアウトの一部。ガチャCSSは全ホームCSSの後、JSが注入するstyleより前に一度だけ読む。

`home-cutout-v084.js` は `assets/home-characters/shioriko/{mode}.png` を使用。modeは `normal / dere / yandere / scold / drunk / clumsy / casual`。`normal.png` と6差分PNGは保護対象。失敗時はcutoutを隠して元画像を表示する。元画像を制御する `shioriko-visual-v052.js` はこのfallbackにも必要。

互換契約は `data-shio-mode`、localStorage `rhythmGame.shiorikoDialogueMode.v1`、イベント `rhythmGameShiorikoModeChanged` / `rhythmGameShiorikoDialogueExpression`。保存キーやイベントをrenameしない。

隠し部屋は右上Verを4秒以内に6回タップ後、8秒以内に左上ロゴを約1.4秒長押し。キャンセル・時間切れ・iOSタッチ処理を維持する。

## 保存とPWA更新

localStorageとIndexedDBの既存キー・IDは互換APIとして扱う。未使用に見えても消さない。特に `rhythmGame.songRecords.v1` と `lovefes.highScores.v1` は両方現役で、勝手に一本化しない。

現役manifestは `manifest-v0812.json`、start_urlは `./?v=0.8.20`。`manifest.json`、`manifest-v0810.json`、`fresh-v0810.html`〜`fresh-v0815.html`、`install-v0812b.html`、旧アイコンは過去に追加されたホーム画面の互換入口なので残す。freshページはversion.jsonを取得してルートへ戻る。旧HTMLをアプリ本体へ戻す変更は禁止。

indexはversion.jsonを `cache:'no-store'` と日時クエリで取得。変更したJS/CSSだけURLクエリを更新し、整理だけでAPP_VERSIONを上げる必要はない。現在service workerと登録コードはない。新規にSWやキャッシュ削除処理を導入すると既存挙動が変わるので別作業とする。

## デプロイ・検証

GitHub Pagesはmainのルートを既存のGitHub生成 `pages build and deployment` で配信する。npm buildやバンドル工程はない。過去の単発画像/バージョン変更workflowをデプロイ目的で再導入しない。

1. `git fetch origin main` で最新化し、依存関係を確認。
2. 変更JSを `node --check`、JSONをparse、`git diff --check`。保護対象の差分がないことを確認。
3. HTTPサーバー上でPC/横向きタッチ、7モード、隠しコマンド、設定保存、判定調整、部室、ガチャ、LIVE/リザルト/リトライ、console/404を変更前と比較。
4. 分割コミットをmainへ反映し、**最終SHAの**Pages build/deploy successと配信ファイルを確認。
5. iPhoneホーム画面起動、音の聞こえ方、Android実機のタッチは実機確認結果を別途記録。エミュレーションを実機検証と呼ばない。

## 既知の既存問題

今回の整理とは分けて扱う。ユーザー確認なしに挙動を変えない。

- 結果表示の2系統でIDとrank基準が重複。保存キーは両方維持。
- 現役manifest-v0812.jsonにはicons配列がない（manifest.jsonには存在）。
- 10成功ボイスには複数のカウンタと再生経路がある。音源・端末追加互換性を含めて調べてから整理する。
