# 栞子GLB制作・組み込み手順

本番モデルは **未制作／未納品**。簡易モデルを完成品と扱わない。
`model.json.status` は制作状況の記録であり、実行時の読込ゲートではない。
指定パスに正常なGLBがあれば読み込み、未配置・破損・読込失敗なら既存プロトタイプを表示する。

## 制作環境と工程

Blender 4.x を使用。まず別名で作業ファイルを保存し、`tools/blender/shioriko_scene_setup.py` を実行する。
再実行で既存メッシュ・マテリアル・リグを上書きしない。空のリグ容器とコレクションを作るだけで、顔や衣装は生成しない。
既存版のスクリプトで作った骨が一列に並んだ仮リグは使用せず、人が関節位置・階層・ウェイトを調整する。

1. 承認済みホーム立ち絵から正面・横・背面・顔拡大の制作資料を整理し、衣装背面など不明な部分を人が決める。
2. 顔と短い青緑の髪を先行制作。頬、目、編み込み、外ハネを近距離と全周でレビュー。長髪へ戻さない。
3. 黒コルセット、青緑チェック、金、白レース、多層・非対称スカート、帽子、薔薇、羽根、チョーカー、リボン、鎖、ガーター、柄ストッキング、編み上げブーツを制作する。
4. リトポロジー、UV、ベイク、PBR素材を整える。2048pxを出荷基準とし、180k trisを超えない。チェック柄とレースの透過は実機で確認する。
5. BlenderはZ上・-Y前、メートル、足Z=0、身長約1.6m。変形前に回転・スケールを適用。glTF書き出しでY上・+Z前になる。
6. 手・頭・目の命名は仕様書どおり。顔メッシュは `Face`、眼球メッシュは `Eyes_L/R`、目の骨は `Eye_L/R`。結合メッシュはskinウェイトによるタッチ解決に対応する。
7. 表情は実際の変形を作る。`Neutral` は全モーフ0の基準顔。`Blink` または `Blink_L` + `Blink_R` を用意。Blushは頬色を持ったメッシュの変形などGLBモーフで再現できる方式を採用（Blender専用ドライバーは実行時に動かない）。
8. Idle/Wave/Look/Dance_01は同名のNLAトラックに整理し、対象リグ・シェイプキーのトラックを同名にしてまとめる。未制作クリップは警告扱いで、実行時ボタンは無効になる。
9. 出荷するメッシュとリグを `06_EXPORT` にリンクする。リファレンス、ライト、カメラ、作業用メッシュは入れない。
10. 正面・斜め・横・背面・真上・真下、表情、Waveとダンスの貫通を人が確認。シーンの `shioriko_visual_review` カスタムプロパティに確認者・日付・承認資料を記録する。文字列は品質の自動保証ではない。

## 検証・書き出し

リポジトリルートから（パスは実際のBlender実行ファイルに置換）：

```sh
blender assets/models/shioriko/source/shioriko-live-v1.blend --background --python-exit-code 1 --python tools/blender/shioriko_export.py -- --check-only
blender assets/models/shioriko/source/shioriko-live-v1.blend --background --python-exit-code 1 --python tools/blender/shioriko_export.py
python tools/validate_shioriko_glb.py
```

最終パス：`assets/models/shioriko/shioriko-live-v1.glb`。
GLB内にテクスチャを埋め込み、外部URIを使わない。現段階は通常のPNG/JPEG、非圧縮メッシュ。KTX2/Draco/VRMはまだ対応しない。
Blenderチェックは不足部品・リグ・UV・表情・寸法・テクスチャ・三角形予算を検査する。
出力後チェッカーはヘッダー、BIN範囲、組み込み画像寸法、命名、モーフ、予算を検査する。完全なglTF仕様検証は別途Khronos glTF Validatorで行う。
GLB追加時は `model.json.assetRevision` を更新する。最終承認後に `status` を `ready` にする。
失敗を隠す空のGLBやダミーモーフを出荷しない。

## ブラウザAPIと寿命

`window.__shiorikoProduction3D` は画面のライフサイクル管理用。

- `mode`: unloaded / fallback / production、`rendering`: 描画ループの状態。
- `setExpression('Smile', 0.8)` は他表情をリセットして複数メッシュの同名モーフへ適用。
- `setExpression('Blink', 1, {exclusive:false})` は重ね合わせ。未対応名はfalse。
- `setExpression('Neutral')` は全モーフをリセット。
- `playClip('Wave', false)` は単発、その後Idle。存在しないクリップはfalse。
- `reload()` は現在のモデルを完全解放し、表示中なら再読込。
- `dispose()` は管理リスナーも除去する最終破棄。ページ再読込まで再初期化しない。
- `shioriko-touch` イベントを部屋要素に送出。detail.target はHead/LeftHand/RightHand/Body。

AnimationMixerで表情をアニメーションするクリップと手動表情を同時に使う場合、アニメーション側が毎フレーム上書きする。制作時に表情トラックの所有を分ける。
プロトタイプはモーフ・AnimationMixer APIを提供しない（falseを返す）。既存の簡易アクションを維持する。

ふれあいに入るまでThree.js/モデルを取得しない。閉じる・非表示・pagehideでRAFを止め、イベント、タイマー、ResizeObserver、Mixer、geometry/material/texture、WebGLコンテキストを解放する。開き直しで再生成する。
30fps上限、DPR最大1.5。ルートアニメーションを壊さないよう、寸法合わせは親グループで行う。
CDNは既存のThree.js 0.180.0を固定使用。初回オフラインやCDN障害時には3D表示できない。ゲームのローカル保存は変更しない。

## 動作検証

```sh
npm install --no-save three@0.180.0 playwright
npx playwright install chromium
node tests/shioriko-3d.cjs
python -m unittest discover -s tests -p 'test_*glb.py'
```

既存の依存を使う場合は `THREE_PACKAGE` と `PLAYWRIGHT_MODULE` で絶対パスを指定できる。
ブラウザテストは実際のThree/GLTFLoaderを使用し、テスト用GLBをメモリ上のみで作成する。これは制作モデルでも品質見本でもない。
実機iPhoneでは、PWAを開き、出入り・アプリ切替・ライブ開始・再開、メモリ、フレーム時間と発熱を別途測定する。自動テストやPC表示だけでモデルの品質承認をしない。

未実装：本番メッシュ・テクスチャ・リグ・全表情・全クリップ、二次揺れ物理、VRM、圧縮デコーダ、LOD、実機での品質承認。

書き出しAPI参考：[Blender公式 glTF Export Operators](https://docs.blender.org/api/main/bpy.ops.export_scene.html)。

今回の検証：Chromiumで上記ブラウザテスト、GLB検証器の6テスト、Python構文検査を実施。Blender本体は作業環境にないためBlender内実行・実モデル書き出しは未検証。実機iPhone検証も未実施。ゲーム全体の検証では既存のvoice-direct.js／voice-events.jsの音声データ警告が出るが、この変更では当該ファイルに触れていない。
