# Runtime dependency audit — 2026-09-16

基準main: `ca04738e79747a07b8580894a912e9636248bfbf` (fetchで最新確認)。このコミットは監査のみ。

## 方法と境界

全230追跡ファイルを列挙し、indexの順序、JS/CSS/HTML/manifestの直接参照、文字列による動的ロード、テンプレートによる画像パス、グローバル関数の上書き、全28 workflowを確認。静的な文字列未参照だけでは削除を決めない。全画像・音源・譜面・キャラ/ガチャ/会話データ・ストレージキーはKEEP。ブラウザはWindows Edgeの空プロファイルで変更前を観測。

## 読み込み順: 外部JS 44本

|順|ファイル|役割|依存|統合判断 / 削除可否|
|---|---|---|---|---|
|1|character-data.js|キャラクター基礎データ|CHARACTER_LIBRARYを定義|KEEP: 保護対象データ|
|2|character-overrides.js|画像・キャラクター補正|character-data.js|KEEP: ID互換性|
|3|character-default-override.js|初期キャラクター補正|character-data.js / icons|KEEP: 画像保護|
|4|character-series-overrides.js|シリーズ補正|CHARACTER_LIBRARY|KEEP: データ保護|
|5|character-fixes-v037.js|キャラクター修正|上記データ・ローカル画像|KEEP: 最終データ補正|
|6|gacha-data-v045.js|ガチャ候補・所有キャラ|CHARACTER_LIBRARY / localStorage|KEEP: データ保護|
|7|app.js|ゲーム状態・DOM・基本判定・入力|index.html / laneKeys / HIT_WINDOWS|本体: KEEP|
|8|settings.js|速度・判定強化・補正・カスタム音設定|app.js / localStorage / IndexedDB|KEEP: 設定互換性|
|9|tap-boost.js|シャン音データ・音声準備|settings.js / AudioContext|KEEP: 音源保護|
|10|voice-events.js|10成功トリガー・スプライト音源|app.js registerHit/resetGame|KEEP: 音源保護、後続のカウンタと重複あり|
|11|voice-manager.js|内蔵/端末追加ボイス管理UI|voice-events.js / IndexedDB / settings|KEEP: 保存互換性|
|12|calibration.js|12回の判定調整|app.js / settings.js|独立維持: KEEP|
|13|touch-guards.js|プレイ中ブラウザジェスチャー抑止|game / playing-mode|独立維持: KEEP|
|14|pause.js|右下ポーズUI・再開・中断|app.js / currentMs / loop|独立維持: KEEP|
|15|home.js|画面遷移・設定要約・9レーン保存|settings / character library / calibration|本体: KEEP|
|16|song-presets.js|スピカ譜面・端末音源保存|charts/spica-terrible.json / IndexedDB / app|独立維持: KEEP|
|17|audio-fixes.js|成功カウンタ・スプライト音声・音量調整|app / voice-events / tap-boost|KEEP: 別カウンタあり。音声挙動を変えず統合するには追加検証必要|
|18|voice-direct.js|端末追加音声のHTMLAudio経路|voice-manager / voice-events|KEEP: voice-independentが非builtin再生を保持|
|19|voice-fullhouse-v040.js|個別内蔵音声データ|LOVEFES_BUILTIN_VOICES → voice-independent|KEEP: 音源保護|
|20|voice-nanisore-v040.js|個別内蔵音声データ|LOVEFES_BUILTIN_VOICES → voice-independent|KEEP: 音源保護|
|21|voice-dareka-v040.js|個別内蔵音声データ|LOVEFES_BUILTIN_VOICES → voice-independent|KEEP: 音源保護|
|22|voice-nico-v040.js|個別内蔵音声データ|LOVEFES_BUILTIN_VOICES → voice-independent|KEEP: 音源保護|
|23|voice-ieni-v040.js|個別内蔵音声データ|LOVEFES_BUILTIN_VOICES → voice-independent|KEEP: 音源保護|
|24|voice-yohane-v040.js|個別内蔵音声データ|LOVEFES_BUILTIN_VOICES → voice-independent|KEEP: 音源保護|
|25|voice-independent-v040.js|6内蔵音声再生・動的リザルト読込|voice-direct / LOVEFES_BUILTIN_VOICES / result-enhancements-v041.js|独立維持: 動的ロードは結果ラッパー順に関係するのでKEEP|
|26|home-result-v049.js|結果記録・会話データ・ホーム反応|home.js / finishGame / localStorage|KEEP: 会話・記録キー保護。結果ID重複あり|
|27|home-layout-v042.js|ホームメニュー・通知履歴・ガチャCSS|home.js / gacha-data / gacha-v045.css|KEEP: 重複CSSリクエストを安全に整理候補|
|28|hidden-admin-v048.js|隠しコマンド・管理人設定|home DOM / localStorage / gacha|独立維持: KEEP|
|29|shioriko-secret-modes-v050.js|7モード・会話・管理人選択UI|home-result / hidden-admin / modeイベント|KEEP: 会話・モード保護|
|30|shioriko-visual-v052.js|元画像表情・タップ反応・フォールバック|secret-modes / home image / expression assets|KEEP: cutout失敗時の元画像経路|
|31|gacha-v045.js|10連・封筒・UR表示・所有保存|gacha-data / hidden-admin / home|独立維持: KEEP|
|32|fixes-v051.js|楽曲一覧/端末追加・UR画像/部室描画|app / home / song-presets / gacha|KEEP: 機能が混在。全body再走査のみ削減候補|
|33|tap-sound-fix-v068.js|最終シャン音プール・iOSフォールバック|tap-boost BOOSTED_TAP_DATA / Audio|独立維持: KEEP、判定と分離|
|34|stability-fix-v071.js|プレイ描画CSS・右下ポーズ|pause.js / game|重複pointerハンドラのみ統合候補。CSS順を維持|
|35|smooth-clock-v072.js|最終高精度時計・音源同期|app audio / offsetInput|独立維持: KEEP、方式変更禁止|
|36|canvas-notes-v073.js|最終Canvas描画・表示ノーツ走査|app / settings progress / smooth-clock|独立維持: KEEP、幾何計算共有は将来候補|
|37|runtime-tuning-v074.js|HUD更新のrAF集約|app updateHud|app.jsへの統合候補。旧バージョン上書きは別問題|
|38|songs-v075.js|追加楽曲カード・旧譜面生成|fixes-v051 library / song-presets|KEEP: v077の前にカードを生成、譜面保護|
|39|songs-v077.js|追加楽曲の最終譜面・カード差替|songs-v075 / library / song-presets|KEEP: 現行譜面保護|
|40|input-fix-v077.js|最終レーン索引・timestamp入力・touch fallback|app / currentMs / pause|独立維持: KEEP、判定強化未参照は既存不具合|
|41|song-select-v082.js|カルーセル・選曲・検索|fixes-v051 / songs-v075 / songs-v077|独立維持: KEEP、hidden gridもデータ源|
|42|home-transparent-v083.js|旧0.8.4通知/表示の3回上書きのみ|home version / updateBanner|CSS機能なし。仕様修正の承認後に削除候補|
|43|home-cutout-v084.js|7種PNG・モードイベント・元画像fallback|secret-modes / image assets / mode storage|KEEP: 変更禁止|
|44|home-branding-v085.js|承認ロゴ・立ち絵候補登録|home DOM / branding asset|独立維持: KEEP|

追加の現役JS: `result-enhancements-v041.js` は voice-independent-v040.js が動的に読み込む。日時クエリ付き。未使用ではない。`lovefes.highScores.v1` と `rhythmGame.songRecords.v1` は両方保存される。重複IDと異なるrank閾値があるため、統合で一方を消さない。

## CSS: 18本と注入ルール

|順|ファイル|主な役割|重複・後勝ち・統合判断|
|---|---|---|---|
|1|styles.css|全体/ゲーム基本|機能別維持。動的/hidden画面用ルールもKEEP|
|2|touch-guards.css|タッチ制御|機能別維持。動的/hidden画面用ルールもKEEP|
|3|pause.css|ポーズ|機能別維持。動的/hidden画面用ルールもKEEP|
|4|calibration.css|判定調整|機能別維持。動的/hidden画面用ルールもKEEP|
|5|home.css|ホーム/設定/部室基本|前段ホームCSSを部分上書き。media条件と!importantを維持。大規模統合KEEP|
|6|home-night-v079.css|夜空/パネル配色|前段ホームCSSを部分上書き。media条件と!importantを維持。大規模統合KEEP|
|7|home-stars-v080.css|星のbefore層|前段ホームCSSを部分上書き。media条件と!importantを維持。大規模統合KEEP|
|8|home-bright-stars-v081.css|明るい星のafter層|home-starsと .home-screen .home-main>* が完全重複。星は別疑似要素なので両方KEEP|
|9|song-select-v082.css|カルーセル|機能別維持。動的/hidden画面用ルールもKEEP|
|10|home-result-v041.css|リザルト/会話|前段ホームCSSを部分上書き。media条件と!importantを維持。大規模統合KEEP|
|11|home-layout-v042.css|横向き配置/メニュー|前段ホームCSSを部分上書き。media条件と!importantを維持。大規模統合KEEP|
|12|hidden-admin-v048.css|隠し管理人|機能別維持。動的/hidden画面用ルールもKEEP|
|13|gacha-v045.css|ガチャ/通知履歴|home-layoutが同一内容を別クエリで末尾へ再読込。後勝ち位置を維持して1回へ整理候補|
|14|shioriko-visual-v052.css|栞子表情/演出|機能別維持。動的/hidden画面用ルールもKEEP|
|15|home-transparent-v083.css|透過面の最終補正|前段ホームCSSを部分上書き。media条件と!importantを維持。大規模統合KEEP|
|16|home-cutout-v084.css|立ち絵・元画像fallback|前段ホームCSSを部分上書き。media条件と!importantを維持。大規模統合KEEP|
|17|home-branding-v085.css|ロゴ/隠しコマンドhit領域|前段ホームCSSを部分上書き。media条件と!importantを維持。大規模統合KEEP|
|18|home-layering-v0814.css|承認済み立ち絵配置|最終配置。ファイル全体KEEP/変更禁止|

注入: home-layout → gacha CSS、shioriko-visual → clumsy marker、fixes-v051 → UR crop/song library、stability → pause/game、canvas → canvas visibility。注入順もcascadeの一部。未使用selectorは動的DOM・モード・疑似要素・メディア条件があるためカバレッジ1回では削除不可。home-transparent の card background、home-layering の topbar background/border 等は前段を上書きするが、承認レイアウトを優先してKEEP。

## 実行時監査

- appのDOM描画loopはcanvasに上書きされ、最終のゲームrAFは1系統。HUD rAFは表示更新集約で別用途。calibration rAFは測定中のみ。タイマー方式は変更しない。
- fixes-v051のbody subtree childList監視がHUDテキスト変更にも反応し、毎回全documentのガチャ画像を走査。追加された要素のみに絞る候補。
- pause.jsとstabilityの同一ボタンpointerdownは重複。input-fixのcaptureはプレイ中に後段へ伝播を止める。pause本体の直接ハンドラを残しstability追加分を削除可能。
- shioriko-visualは元画像src/character-id限定監視。cutout失敗時に必要でKEEP。secret-modesは管理人UI挿入後disconnect。
- songs-v075/v077は同じhidden属性を監視するがカード生成→差替の順序依存。譜面も含むためKEEP。song-selectはgrid変更を1rAFへ集約。
- 現役setIntervalなし。50ms再試行はsong-selectの依存DOM待ち。現状は同期作成済みで常駐しない。古いshioriko-modeのintervalは未読込。
- currentMsはsmooth-clockが最終実装でoffsetInputを読む。旧settingsの毎回localStorage取得は最終時計では使われない。保存互換性のためキーは全KEEP。
- voice-eventsとaudio-fixesは両方registerHitを包み10成功カウンタを持つ。後段がplayRandomTenHitVoiceを再定義するので旧コメントの「disable」は不正確。音声挙動変更を伴う統合はKEEP。
- canvasは幾何をresize/orientationで無効化してキャッシュ。入力はレーン別索引。毎frameでDOMノーツを作らない。appの幾何計算との共有は今回見送り。
- HTMLのhidden live/settings/character/result/calibrationはすべて実利用。songLibraryGridはhiddenでもカルーセルのデータ源。homeTimingBtnはhome-layoutで除去されるが設定内の判定調整は存続。

## 変更前からの仕様相違（整理による新規不具合ではない）

1. 画面は旧home-transparentの後勝ちでVer.0.8.4。APP_VERSION/version.jsonは0.8.20。
2. input-fixの最終判定はHIT_WINDOWS.perfectを使い、getPerfectWindow()を使わない。ON時±70msが反映されない。
3. resultRank/resultFullCombo/resultNewRecordが2個ずつ。2種の記録キー・rank基準が共存。
4. 現役manifest-v0812.jsonにはicons配列がない。manifest.jsonには存在。既存PWA挙動を変えないため監査では修正しない。
5. リポジトリにservice workerも登録処理も存在しない。オフライン起動を保証する構成ではない。既存端末に残る登録はこの環境では確認不可。

## PWA / デプロイ

index → manifest-v0812.json → ./?v=0.8.20。fresh-v0810〜v0815はversion.jsonを取得してルートへredirectする互換入口。install-v0812b.htmlも既存ホーム画面URLになり得るのでKEEP。manifest.json / manifest-v0810.json / 全iconsもKEEP。indexのversion.json取得はno-store、日時クエリ、v比較で無限redirectを防止。

基準SHAの `pages build and deployment` run 35056670887 はsuccess。これはGitHub生成のPages処理で、リポジトリ内の過去パッチworkflowではない。既存mainルート配信を維持し、新規デプロイworkflowは追加しない。

## workflow全件分類

|ファイル|分類|判断根拠|
|---|---|---|
|.github/workflows/app-icon-refresh.yml|画像転送/生成・過去一時修正|DELETE候補: Refresh app icon; Pages deploy actionなし、旧値を生成/適用する単発処理|
|.github/workflows/apply-bright-icon-v089.yml|画像転送/生成・過去一時修正|DELETE候補: Apply bright app icon v0.8.9; Pages deploy actionなし、旧値を生成/適用する単発処理|
|.github/workflows/apply-ios-hidden-command-v0817.yml|過去一時修正|DELETE候補: Apply iOS hidden command v0.8.17; Pages deploy actionなし、旧値を生成/適用する単発処理|
|.github/workflows/apply-normal-art-v0820.yml|画像転送/生成・過去一時修正|DELETE候補: Apply official Shioriko high-res normal art v0.8.20; Pages deploy actionなし、旧値を生成/適用する単発処理|
|.github/workflows/apply-shioriko-six-png-v0820.yml|画像転送/生成・過去一時修正|DELETE候補: Apply remaining Shioriko PNG modes v0.8.20; Pages deploy actionなし、旧値を生成/適用する単発処理|
|.github/workflows/apply-v0814-layout.yml|過去一時修正|DELETE候補: Apply home character layout v0.8.14; Pages deploy actionなし、旧値を生成/適用する単発処理|
|.github/workflows/apply-v0815-character-assets.yml|画像転送/生成・過去一時修正|DELETE候補: Apply Shioriko standing art assets v0.8.15; Pages deploy actionなし、旧値を生成/適用する単発処理|
|.github/workflows/bump-art-restore-v0819.yml|バージョン更新専用|DELETE候補: Bump art restore v0.8.19; Pages deploy actionなし、旧値を生成/適用する単発処理|
|.github/workflows/bump-v0820.yml|バージョン更新専用|DELETE候補: Bump recovery version v0.8.20; Pages deploy actionなし、旧値を生成/適用する単発処理|
|.github/workflows/bump-v088.yml|バージョン更新専用|DELETE候補: Bump v0.8.8; Pages deploy actionなし、旧値を生成/適用する単発処理|
|.github/workflows/cache-bypass-v0810.yml|過去一時修正|DELETE候補: Cache bypass v0.8.10; Pages deploy actionなし、旧値を生成/適用する単発処理|
|.github/workflows/diagnose-normal-png-v0820.yml|診断専用|DELETE候補: Diagnose Shioriko normal art as PNG v0.8.20; Pages deploy actionなし、旧値を生成/適用する単発処理|
|.github/workflows/finalize-v0815-direct.yml|過去一時修正|DELETE候補: Finalize direct standing art v0.8.15; Pages deploy actionなし、旧値を生成/適用する単発処理|
|.github/workflows/fix-hidden-command-v0816.yml|過去一時修正|DELETE候補: Fix hidden command v0.8.16; Pages deploy actionなし、旧値を生成/適用する単発処理|
|.github/workflows/fix-icon-v0812.yml|画像転送/生成・過去一時修正|DELETE候補: Fix bright iOS icon v0.8.12; Pages deploy actionなし、旧値を生成/適用する単発処理|
|.github/workflows/fix-icon-v086.yml|画像転送/生成・過去一時修正|DELETE候補: Fix v0.8.6 app icon background; Pages deploy actionなし、旧値を生成/適用する単発処理|
|.github/workflows/fix-ios-icon-v087.yml|画像転送/生成・過去一時修正|DELETE候補: Fix iOS app icon v0.8.7; Pages deploy actionなし、旧値を生成/適用する単発処理|
|.github/workflows/fix-version-display-v0811.yml|バージョン更新専用|DELETE候補: Fix version display v0.8.11; Pages deploy actionなし、旧値を生成/適用する単発処理|
|.github/workflows/fix-version-v0811b.yml|バージョン更新専用|DELETE候補: Apply version display fix v0.8.11; Pages deploy actionなし、旧値を生成/適用する単発処理|
|.github/workflows/generate-home-cutouts.yml|画像転送/生成・過去一時修正|DELETE候補: Generate home character cutouts; Pages deploy actionなし、旧値を生成/適用する単発処理|
|.github/workflows/generate-v085-icons.yml|画像転送/生成・過去一時修正|DELETE候補: Generate v0.8.5 icons; Pages deploy actionなし、旧値を生成/適用する単発処理|
|.github/workflows/home-layering-v0813.yml|過去一時修正|DELETE候補: Apply home layering v0.8.13; Pages deploy actionなし、旧値を生成/適用する単発処理|
|.github/workflows/normalize-normal-png-v0820.yml|画像転送/生成・過去一時修正|DELETE候補: Normalize Shioriko normal PNG for iPhone; Pages deploy actionなし、旧値を生成/適用する単発処理|
|.github/workflows/publish-v084.yml|過去一時修正|DELETE候補: Publish v0.8.4 transparent home assets; Pages deploy actionなし、旧値を生成/適用する単発処理|
|.github/workflows/publish-v085-assets.yml|画像転送/生成・過去一時修正|DELETE候補: Publish v0.8.5 assets; Pages deploy actionなし、旧値を生成/適用する単発処理|
|.github/workflows/publish-v085-final.yml|過去一時修正|DELETE候補: Publish v0.8.5 final branding; Pages deploy actionなし、旧値を生成/適用する単発処理|
|.github/workflows/upgrade-shioriko-art-v0818.yml|画像転送/生成・過去一時修正|DELETE候補: Upgrade Shioriko art v0.8.18; Pages deploy actionなし、旧値を生成/適用する単発処理|
|.github/workflows/upgrade-shioriko-art-v0818b.yml|画像転送/生成・過去一時修正|DELETE候補: Upgrade Shioriko art v0.8.18b; Pages deploy actionなし、旧値を生成/適用する単発処理|

## 未使用候補と全ファイル判定

DELETE候補はコード変更前に分類。直接名参照に加え、現役JSのdynamic script生成はresult-enhancementsのみであること、CSS import/manifest/redirectも確認。保護データは未参照でもKEEP。

|ファイル|判断|根拠 / 参照元（文字列照合は参考）|
|---|---|---|
|.icon-v0812/chunk0.txt|DELETE候補|過去workflow向けbase64転送断片/説明のみ。本番実行に不要、完成画像は全保持。 .github/workflows/fix-icon-v0812.yml|
|.icon-v0812/chunk1.txt|DELETE候補|過去workflow向けbase64転送断片/説明のみ。本番実行に不要、完成画像は全保持。 .github/workflows/fix-icon-v0812.yml|
|.icon-v0812/chunk2.txt|DELETE候補|過去workflow向けbase64転送断片/説明のみ。本番実行に不要、完成画像は全保持。 .github/workflows/fix-icon-v0812.yml|
|.icon-v0812/chunk3.txt|DELETE候補|過去workflow向けbase64転送断片/説明のみ。本番実行に不要、完成画像は全保持。 .github/workflows/fix-icon-v0812.yml|
|.v0814-assets/casual.b64|DELETE候補|過去workflow向けbase64転送断片/説明のみ。本番実行に不要、完成画像は全保持。 |
|.v0814-assets/direct-casual.b64|DELETE候補|過去workflow向けbase64転送断片/説明のみ。本番実行に不要、完成画像は全保持。 |
|.v0814-assets/direct-clumsy.b64|DELETE候補|過去workflow向けbase64転送断片/説明のみ。本番実行に不要、完成画像は全保持。 |
|.v0814-assets/direct-dere.b64|DELETE候補|過去workflow向けbase64転送断片/説明のみ。本番実行に不要、完成画像は全保持。 |
|.v0814-assets/direct-drunk.b64|DELETE候補|過去workflow向けbase64転送断片/説明のみ。本番実行に不要、完成画像は全保持。 |
|.v0814-assets/direct-normal.b64|DELETE候補|過去workflow向けbase64転送断片/説明のみ。本番実行に不要、完成画像は全保持。 |
|.v0814-assets/direct-scold.b64|DELETE候補|過去workflow向けbase64転送断片/説明のみ。本番実行に不要、完成画像は全保持。 |
|.v0814-assets/direct-yandere.b64|DELETE候補|過去workflow向けbase64転送断片/説明のみ。本番実行に不要、完成画像は全保持。 |
|.v0814-assets/normal-full.b64|DELETE候補|過去workflow向けbase64転送断片/説明のみ。本番実行に不要、完成画像は全保持。 |
|.v0814-assets/normal.b64|DELETE候補|過去workflow向けbase64転送断片/説明のみ。本番実行に不要、完成画像は全保持。 |
|.v0814/normal.0.b64|DELETE候補|過去workflow向けbase64転送断片/説明のみ。本番実行に不要、完成画像は全保持。 |
|.v0814data/normal.0.b64|DELETE候補|過去workflow向けbase64転送断片/説明のみ。本番実行に不要、完成画像は全保持。 |
|.v0815-direct/README.txt|DELETE候補|過去workflow向けbase64転送断片/説明のみ。本番実行に不要、完成画像は全保持。 |
|README.md|KEEP|不明またはドキュメント。KEEP。 |
|app.js|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html, settings.js|
|apple-touch-icon-v0810.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 .github/workflows/cache-bypass-v0810.yml, .github/workflows/fix-version-display-v0811.yml, fresh-v0810.html, fresh-v0811.html|
|apple-touch-icon-v0812.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 .github/workflows/fix-icon-v0812.yml, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|apple-touch-icon-v0812b.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 install-v0812b.html|
|apple-touch-icon.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 .github/workflows/apply-bright-icon-v089.yml, .github/workflows/cache-bypass-v0810.yml, .github/workflows/fix-icon-v0812.yml, .github/workflows/fix-ios-icon-v087.yml, .github/workflows/fix-version-display-v0811.yml|
|assets/branding/README-v085.txt|KEEP|不明またはドキュメント。KEEP。 |
|assets/branding/lovefes-logo-v085.webp|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 home-branding-v085.js|
|assets/gacha-envelope-n-v046.webp|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 gacha-v045.css|
|assets/gacha-envelope-ur-v046.webp|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 gacha-v045.css|
|assets/home-characters/shioriko/candidates/stage-v085.webp|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 home-branding-v085.js|
|assets/home-characters/shioriko/casual.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 .github/workflows/apply-shioriko-six-png-v0820.yml|
|assets/home-characters/shioriko/casual.webp|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 |
|assets/home-characters/shioriko/clumsy.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 .github/workflows/apply-shioriko-six-png-v0820.yml|
|assets/home-characters/shioriko/clumsy.webp|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 |
|assets/home-characters/shioriko/dere.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 .github/workflows/apply-shioriko-six-png-v0820.yml|
|assets/home-characters/shioriko/dere.webp|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 |
|assets/home-characters/shioriko/drunk.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 .github/workflows/apply-shioriko-six-png-v0820.yml|
|assets/home-characters/shioriko/drunk.webp|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 |
|assets/home-characters/shioriko/normal.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 .github/workflows/diagnose-normal-png-v0820.yml, .github/workflows/normalize-normal-png-v0820.yml|
|assets/home-characters/shioriko/normal.webp|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 .github/workflows/apply-normal-art-v0820.yml, .github/workflows/diagnose-normal-png-v0820.yml|
|assets/home-characters/shioriko/scold.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 .github/workflows/apply-shioriko-six-png-v0820.yml|
|assets/home-characters/shioriko/scold.webp|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 |
|assets/home-characters/shioriko/yandere.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 .github/workflows/apply-shioriko-six-png-v0820.yml|
|assets/home-characters/shioriko/yandere.webp|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 |
|assets/home-gacha-v042.webp|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 .github/workflows/generate-home-cutouts.yml, home-layout-v042.js|
|assets/home-live-v042.webp|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 .github/workflows/generate-home-cutouts.yml, home-layout-v042.js|
|assets/home-room-v042.webp|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 .github/workflows/generate-home-cutouts.yml, home-layout-v042.js|
|assets/home-settings-v042.webp|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 .github/workflows/generate-home-cutouts.yml, home-layout-v042.js|
|assets/home-ui/gacha.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 home-cutout-v084.js|
|assets/home-ui/live.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 home-cutout-v084.js|
|assets/home-ui/room.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 home-cutout-v084.js|
|assets/home-ui/settings.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 home-cutout-v084.js|
|assets/monthly-song-full/.keep|KEEP|不明またはドキュメント。KEEP。 |
|assets/monthly-song-full/ai.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 |
|assets/monthly-song-full/ayumu.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 |
|assets/monthly-song-full/ema.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 |
|assets/monthly-song-full/kanata.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 |
|assets/monthly-song-full/karin.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 |
|assets/monthly-song-full/kasumi.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 |
|assets/monthly-song-full/lanzhu.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 |
|assets/monthly-song-full/mia.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 |
|assets/monthly-song-full/rina.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 |
|assets/monthly-song-full/setsuna.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 |
|assets/monthly-song-full/shioriko.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 |
|assets/monthly-song-full/shizuku.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 |
|assets/monthly-song/ai.webp|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 |
|assets/monthly-song/ayumu.webp|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 |
|assets/monthly-song/emma.webp|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 |
|assets/monthly-song/kanata.webp|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 |
|assets/monthly-song/karin.webp|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 |
|assets/monthly-song/kasumi.webp|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 |
|assets/monthly-song/lanzhu.webp|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 |
|assets/monthly-song/mia.webp|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 |
|assets/monthly-song/rina.webp|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 |
|assets/monthly-song/setsuna.webp|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 |
|assets/monthly-song/shioriko.webp|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 |
|assets/monthly-song/shizuku.webp|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 |
|assets/shioriko-expressions/casual-v058.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 shioriko-visual-v052.js|
|assets/shioriko-expressions/casual.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 |
|assets/shioriko-expressions/casual.webp|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 shioriko-expression-assets-v055.js|
|assets/shioriko-expressions/clumsy-v058.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 shioriko-visual-v052.js|
|assets/shioriko-expressions/clumsy.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 |
|assets/shioriko-expressions/clumsy.webp|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 shioriko-expression-assets-v055.js|
|assets/shioriko-expressions/dere-v058.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 shioriko-visual-v052.js|
|assets/shioriko-expressions/dere.webp|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 shioriko-expression-assets-v055.js|
|assets/shioriko-expressions/drunk-v058.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 shioriko-visual-v052.js|
|assets/shioriko-expressions/drunk.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 |
|assets/shioriko-expressions/drunk.webp|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 shioriko-expression-assets-v055.js|
|assets/shioriko-expressions/scold-v058.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 shioriko-visual-v052.js|
|assets/shioriko-expressions/scold.webp|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 shioriko-expression-assets-v055.js|
|assets/shioriko-expressions/yandere-v058.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 shioriko-visual-v052.js|
|assets/shioriko-expressions/yandere.webp|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 shioriko-expression-assets-v055.js|
|audio-fixes.js|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|calibration.css|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|calibration.js|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|canvas-notes-v073.js|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|character-data.js|KEEP|譜面/キャラ/会話/音源データを含むため未読込でも保護。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|character-default-override.js|KEEP|譜面/キャラ/会話/音源データを含むため未読込でも保護。 .github/workflows/app-icon-refresh.yml, fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|character-fixes-v037.js|KEEP|譜面/キャラ/会話/音源データを含むため未読込でも保護。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|character-overrides.js|KEEP|譜面/キャラ/会話/音源データを含むため未読込でも保護。 .github/workflows/app-icon-refresh.yml, fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|character-series-overrides.js|KEEP|譜面/キャラ/会話/音源データを含むため未読込でも保護。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|charts/spica-terrible.json|KEEP|譜面/キャラ/会話/音源データを含むため未読込でも保護。 song-presets.js|
|emma-music-lolita-256.jpg|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 character-fixes-v037.js|
|fixes-v051.js|KEEP|現役依存。 .github/workflows/apply-v0814-layout.yml, .github/workflows/apply-v0815-character-assets.yml, .github/workflows/finalize-v0815-direct.yml, .github/workflows/fix-version-display-v0811.yml, .github/workflows/fix-version-v0811b.yml, fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|fresh-v0810.html|KEEP|既存PWA入口/manifest互換性。KEEP。 .github/workflows/cache-bypass-v0810.yml, .github/workflows/fix-version-v0811b.yml, manifest-v0810.json|
|fresh-v0811.html|KEEP|既存PWA入口/manifest互換性。KEEP。 .github/workflows/fix-version-display-v0811.yml, .github/workflows/fix-version-v0811b.yml|
|fresh-v0812.html|KEEP|既存PWA入口/manifest互換性。KEEP。 .github/workflows/bump-art-restore-v0819.yml, .github/workflows/fix-icon-v0812.yml|
|fresh-v0813.html|KEEP|既存PWA入口/manifest互換性。KEEP。 .github/workflows/home-layering-v0813.yml|
|fresh-v0814.html|KEEP|既存PWA入口/manifest互換性。KEEP。 .github/workflows/apply-v0814-layout.yml|
|fresh-v0815.html|KEEP|既存PWA入口/manifest互換性。KEEP。 .github/workflows/apply-ios-hidden-command-v0817.yml, .github/workflows/apply-v0815-character-assets.yml, .github/workflows/finalize-v0815-direct.yml, .github/workflows/fix-hidden-command-v0816.yml|
|gacha-data-v045.js|KEEP|譜面/キャラ/会話/音源データを含むため未読込でも保護。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|gacha-fixes-v046.js|KEEP|不明またはドキュメント。KEEP。 |
|gacha-v045.css|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, home-layout-v042.js, index.html|
|gacha-v045.js|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|hidden-admin-v048.css|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|hidden-admin-v048.js|KEEP|現役依存。 .github/workflows/apply-ios-hidden-command-v0817.yml, .github/workflows/fix-hidden-command-v0816.yml, fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|hold-notes.css|DELETE候補|全実行入口から未参照。現行機能への読込なし。 |
|hold-notes.js|DELETE候補|全実行入口から未参照。現行機能への読込なし。 |
|home-branding-v085.css|KEEP|現役依存。 .github/workflows/apply-ios-hidden-command-v0817.yml, .github/workflows/fix-hidden-command-v0816.yml, .github/workflows/home-layering-v0813.yml, .github/workflows/publish-v085-final.yml, fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|home-branding-v085.js|KEEP|現役依存。 .github/workflows/apply-bright-icon-v089.yml, .github/workflows/bump-v088.yml, .github/workflows/fix-ios-icon-v087.yml, .github/workflows/fix-version-display-v0811.yml, .github/workflows/publish-v085-final.yml, fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|home-bright-stars-v081.css|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|home-cutout-v084.css|KEEP|現役依存。 .github/workflows/publish-v084.yml, .github/workflows/publish-v085-assets.yml, .github/workflows/publish-v085-final.yml, fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|home-cutout-v084.js|KEEP|現役依存。 .github/workflows/apply-shioriko-six-png-v0820.yml, .github/workflows/apply-v0814-layout.yml, .github/workflows/apply-v0815-character-assets.yml, .github/workflows/diagnose-normal-png-v0820.yml, .github/workflows/finalize-v0815-direct.yml, .github/workflows/fix-icon-v086.yml, .github/workflows/fix-ios-icon-v087.yml, .github/workflows/fix-version-display-v0811.yml, .github/workflows/fix-version-v0811b.yml, .github/workflows/publish-v084.yml, .github/workflows/publish-v085-assets.yml, .github/workflows/publish-v085-final.yml, fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|home-dialogue-v042.css|DELETE候補|全実行入口から未参照。現行機能への読込なし。 |
|home-layering-v0813.css|KEEP|不明またはドキュメント。KEEP。 .github/workflows/apply-v0814-layout.yml, .github/workflows/home-layering-v0813.yml, fresh-v0813.html|
|home-layering-v0814.css|KEEP|現役依存。 .github/workflows/apply-v0814-layout.yml, fresh-v0814.html, fresh-v0815.html, index.html|
|home-layout-v042.css|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|home-layout-v042.js|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|home-night-v079.css|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|home-result-v041.css|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|home-result-v041.js|KEEP|不明またはドキュメント。KEEP。 |
|home-result-v049.js|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|home-stars-v080.css|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|home-transparent-v083.css|KEEP|現役依存。 .github/workflows/publish-v084.yml, fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|home-transparent-v083.js|KEEP|現役依存。 .github/workflows/publish-v084.yml, fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|home.css|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|home.js|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|icon-180-v029.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 .github/workflows/app-icon-refresh.yml|
|icon-180-v029.png.b64.txt|DELETE候補|過去workflow向けbase64転送断片/説明のみ。本番実行に不要、完成画像は全保持。 .github/workflows/app-icon-refresh.yml|
|icon-180-v030.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 .github/workflows/publish-v085-assets.yml|
|icon-180-v085.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 .github/workflows/fix-icon-v086.yml, .github/workflows/generate-v085-icons.yml, .github/workflows/publish-v085-assets.yml|
|icon-180-v086.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 .github/workflows/fix-icon-v086.yml, .github/workflows/fix-ios-icon-v087.yml|
|icon-180-v089.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 .github/workflows/apply-bright-icon-v089.yml|
|icon-180.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 .github/workflows/apply-bright-icon-v089.yml|
|icon-192-v030.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 .github/workflows/publish-v085-assets.yml|
|icon-192-v0810.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 .github/workflows/cache-bypass-v0810.yml, .github/workflows/fix-version-display-v0811.yml, fresh-v0810.html, fresh-v0811.html, manifest-v0810.json|
|icon-192-v085.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 .github/workflows/fix-icon-v086.yml, .github/workflows/generate-v085-icons.yml, .github/workflows/publish-v085-assets.yml|
|icon-192-v086.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 .github/workflows/fix-icon-v086.yml, .github/workflows/fix-ios-icon-v087.yml|
|icon-192-v089.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 .github/workflows/apply-bright-icon-v089.yml|
|icon-192.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 .github/workflows/app-icon-refresh.yml, .github/workflows/apply-bright-icon-v089.yml, .github/workflows/cache-bypass-v0810.yml, .github/workflows/fix-ios-icon-v087.yml, .github/workflows/fix-version-display-v0811.yml, app.js, fixes-v051.js, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, gacha-v045.js, home.js, index.html, manifest.json|
|icon-512-v030.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 .github/workflows/publish-v085-assets.yml, character-default-override.js, fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|icon-512-v0810.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 .github/workflows/cache-bypass-v0810.yml, manifest-v0810.json|
|icon-512-v085.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 .github/workflows/fix-icon-v086.yml, .github/workflows/generate-v085-icons.yml, .github/workflows/publish-v085-assets.yml|
|icon-512-v086.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 .github/workflows/apply-bright-icon-v089.yml, .github/workflows/fix-icon-v086.yml, .github/workflows/fix-ios-icon-v087.yml|
|icon-512-v089.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 .github/workflows/apply-bright-icon-v089.yml|
|icon-512.png|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 .github/workflows/app-icon-refresh.yml, .github/workflows/apply-bright-icon-v089.yml, .github/workflows/cache-bypass-v0810.yml, .github/workflows/fix-ios-icon-v087.yml, manifest.json|
|index.html|KEEP|不明またはドキュメント。KEEP。 .github/workflows/app-icon-refresh.yml, .github/workflows/apply-bright-icon-v089.yml, .github/workflows/apply-ios-hidden-command-v0817.yml, .github/workflows/apply-shioriko-six-png-v0820.yml, .github/workflows/apply-v0814-layout.yml, .github/workflows/apply-v0815-character-assets.yml, .github/workflows/bump-art-restore-v0819.yml, .github/workflows/bump-v0820.yml, .github/workflows/bump-v088.yml, .github/workflows/cache-bypass-v0810.yml, .github/workflows/diagnose-normal-png-v0820.yml, .github/workflows/finalize-v0815-direct.yml, .github/workflows/fix-hidden-command-v0816.yml, .github/workflows/fix-icon-v0812.yml, .github/workflows/fix-icon-v086.yml, .github/workflows/fix-ios-icon-v087.yml, .github/workflows/fix-version-display-v0811.yml, .github/workflows/fix-version-v0811b.yml, .github/workflows/home-layering-v0813.yml, .github/workflows/publish-v084.yml, .github/workflows/publish-v085-assets.yml, .github/workflows/publish-v085-final.yml, .github/workflows/upgrade-shioriko-art-v0818.yml, .github/workflows/upgrade-shioriko-art-v0818b.yml, README.md|
|input-fix-v077.js|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|install-v0812b.html|KEEP|既存PWA入口/manifest互換性。KEEP。 |
|manifest-v0810.json|KEEP|既存PWA入口/manifest互換性。KEEP。 .github/workflows/cache-bypass-v0810.yml, .github/workflows/fix-version-display-v0811.yml, fresh-v0810.html, fresh-v0811.html|
|manifest-v0812.json|KEEP|既存PWA入口/manifest互換性。KEEP。 .github/workflows/apply-v0814-layout.yml, .github/workflows/bump-art-restore-v0819.yml, .github/workflows/bump-v0820.yml, .github/workflows/fix-icon-v0812.yml, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|manifest.json|KEEP|既存PWA入口/manifest互換性。KEEP。 .github/workflows/apply-bright-icon-v089.yml, .github/workflows/cache-bypass-v0810.yml, .github/workflows/fix-icon-v0812.yml, .github/workflows/fix-icon-v086.yml, .github/workflows/fix-ios-icon-v087.yml, .github/workflows/fix-version-display-v0811.yml, .github/workflows/publish-v085-assets.yml, .github/workflows/publish-v085-final.yml|
|notice-history-v045.css|DELETE候補|全実行入口から未参照。現役home-layout/gacha CSSに通知履歴あり。 |
|notice-history-v045.js|DELETE候補|全実行入口から未参照。現役home-layout/gacha CSSに通知履歴あり。 |
|pause.css|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|pause.js|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|performance-fix-v069.js|DELETE候補|全実行入口から未参照。旧DOMプール実験。現行Canvas/入力を使う。 |
|performance-fix-v070.js|DELETE候補|全実行入口から未参照。旧DOMプール実験。現行Canvas/入力を使う。 |
|result-enhancements-v041.js|KEEP|現役依存。 voice-independent-v040.js|
|runtime-tuning-v074.js|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|sample-chart.json|KEEP|譜面/キャラ/会話/音源データを含むため未読込でも保護。 |
|setsuna-music-lolita-256.jpg|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 character-fixes-v037.js|
|settings.js|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|shioriko-expression-assets-v055.js|KEEP|譜面/キャラ/会話/音源データを含むため未読込でも保護。 |
|shioriko-mode-v049.js|KEEP|譜面/キャラ/会話/音源データを含むため未読込でも保護。 |
|shioriko-music-lolita-256.jpg|KEEP|画像/アイコン保護対象。動的参照または用途不明でもKEEP。 character-fixes-v037.js|
|shioriko-secret-modes-v050.js|KEEP|譜面/キャラ/会話/音源データを含むため未読込でも保護。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|shioriko-visual-v052.css|KEEP|譜面/キャラ/会話/音源データを含むため未読込でも保護。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|shioriko-visual-v052.js|KEEP|譜面/キャラ/会話/音源データを含むため未読込でも保護。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|smooth-clock-v072.js|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|song-presets.js|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|song-select-v082.css|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|song-select-v082.js|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|songs-v075.js|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|songs-v077.js|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|stability-fix-v071.js|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|styles.css|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|tap-boost.js|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|tap-sound-fix-v068.js|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html, runtime-tuning-v074.js|
|touch-guards.css|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|touch-guards.js|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|version.json|KEEP|不明またはドキュメント。KEEP。 .github/workflows/app-icon-refresh.yml, .github/workflows/apply-bright-icon-v089.yml, .github/workflows/apply-ios-hidden-command-v0817.yml, .github/workflows/apply-v0814-layout.yml, .github/workflows/apply-v0815-character-assets.yml, .github/workflows/bump-art-restore-v0819.yml, .github/workflows/bump-v0820.yml, .github/workflows/bump-v088.yml, .github/workflows/cache-bypass-v0810.yml, .github/workflows/finalize-v0815-direct.yml, .github/workflows/fix-hidden-command-v0816.yml, .github/workflows/fix-icon-v0812.yml, .github/workflows/fix-icon-v086.yml, .github/workflows/fix-ios-icon-v087.yml, .github/workflows/fix-version-display-v0811.yml, .github/workflows/fix-version-v0811b.yml, .github/workflows/home-layering-v0813.yml, .github/workflows/publish-v084.yml, .github/workflows/publish-v085-assets.yml, .github/workflows/upgrade-shioriko-art-v0818.yml, .github/workflows/upgrade-shioriko-art-v0818b.yml, fresh-v0810.html, fresh-v0811.html, fresh-v0812.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|voice-builtins-v038.js|KEEP|譜面/キャラ/会話/音源データを含むため未読込でも保護。 |
|voice-dareka-v040.js|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|voice-direct.js|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html, voice-localroute-v041.js|
|voice-events.js|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|voice-fullhouse-v040.js|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|voice-ieni-v040.js|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|voice-independent-v040.js|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|voice-localroute-v041.js|DELETE候補|全実行入口から未参照。現役voice-independent/voice-directの経路を維持。 |
|voice-manager.js|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|voice-nanisore-v040.js|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|voice-nico-v040.js|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|
|voice-yohane-v040.js|KEEP|現役依存。 fresh-v0810.html, fresh-v0811.html, fresh-v0813.html, fresh-v0814.html, fresh-v0815.html, index.html|

## 同一内容画像（SHA-256一致、すべてKEEP）

- apple-touch-icon-v0810.png = icon-180-v089.png = icon-180.png
- apple-touch-icon-v0812b.png = apple-touch-icon.png
- icon-192-v0810.png = icon-192-v089.png = icon-192.png
- icon-512-v0810.png = icon-512-v089.png = icon-512.png

## 基準計測

```json
{
  "files": 230,
  "bytes": 64398002,
  "js": 44,
  "css": 18,
  "loadedJsBytes": 337251,
  "loadedCssBytes": 81958
}
```

230ファイルの合計はGit管理対象の作業ツリー容量（.git除外）。Pages artifact実容量とは区別する。初期ロードはEdge/1280x720/空プロファイル/1200msで82リクエスト（blob等を含むPlaywright requestイベント）。JS外部44+動的1、CSS18+動的重複1。未圧縮サイズであり通信圧縮やLighthouse点数ではない。
