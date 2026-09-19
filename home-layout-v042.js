// Ver.0.4.6 patch: square image buttons + gacha + tappable announcement/version history.
(function(){
  const homeMain=document.querySelector('.home-main');
  const updateBanner=document.getElementById('updateBanner');
  const menu=document.querySelector('.home-menu');
  if(!homeMain||!menu) return;

  let right=document.querySelector('.home-right-panel');
  if(!right){right=document.createElement('div');right.className='home-right-panel';homeMain.appendChild(right);}
  if(updateBanner) right.appendChild(updateBanner);
  right.appendChild(menu);
  document.getElementById('homeTimingBtn')?.remove();

  const version=window.APP_VERSION||'0.4.6';
  function decorateButton(id,src,title){
    const btn=document.getElementById(id);
    if(!btn) return null;
    btn.setAttribute('aria-label',title);btn.title=title;
    btn.innerHTML=`<img class="home-menu-art" src="${src}?v=${version}" alt="${title}">`;
    return btn;
  }
  decorateButton('homeLiveBtn','assets/home-live-v042.webp','ライブ');
  decorateButton('homeSettingsBtn','assets/home-settings-v042.webp','設定');
  decorateButton('homeCharactersBtn','assets/home-room-v042.webp','部室');

  let gacha=document.getElementById('homeGachaBtn');
  if(!gacha){gacha=document.createElement('button');gacha.id='homeGachaBtn';gacha.className='home-menu-btn home-menu-gacha';gacha.type='button';menu.appendChild(gacha);}
  decorateButton('homeGachaBtn','assets/home-gacha-v042.webp','勧誘');
  gacha.addEventListener('click',()=>{if(typeof window.openGachaScreen==='function') window.openGachaScreen();});

  const monthlyAssetMap={mia:'lanzhu',rina:'shioriko',setsuna:'setsuna',emma:'emma',shioriko:'rina',lanzhu:'mia',ai:'kanata',shizuku:'karin',ayumu:'kasumi',kasumi:'ayumu',karin:'shizuku',kanata:'ai'};
  const monthlyNames={ayumu:'上原歩夢',kasumi:'中須かすみ',shizuku:'桜坂しずく',karin:'朝香果林',ai:'宮下愛',kanata:'近江彼方',setsuna:'優木せつ菜',emma:'エマ・ヴェルデ',rina:'天王寺璃奈',shioriko:'三船栞子',mia:'ミア・テイラー',lanzhu:'鐘嵐珠'};
  (window.GACHA_UR_POOL||[]).forEach(unit=>{
    const key=unit.baseId;if(!monthlyAssetMap[key]) return;
    const icon=`assets/monthly-song/${monthlyAssetMap[key]}.webp?v=0.4.6`;
    unit.name=`${monthlyNames[key]}【マンスリーソング】`;unit.icon=icon;unit.home=icon;
    const libUnit=(window.CHARACTER_LIBRARY||[]).find(c=>c?.id===unit.id);
    if(libUnit){libUnit.name=unit.name;libUnit.icon=icon;libUnit.home=icon;}
  });

  const HISTORY=[
    {version:'0.8.85',title:'ストーリーにホームボタンを追加',items:['ストーリー画面右上にHOMEボタンを常設しました。','章選択中でもストーリー再生中でも、MENUを開かずにホームへ戻れます。','従来のストーリーメニュー内「ホームへ戻る」も残しています。']},
    {version:'0.8.84',title:'ライブ準備画面をさらに整理',items:['「楽曲選択へ」に加えて「ホーム」ボタンを追加しました。','選択中の楽曲表示を「ライブ準備」見出しより上へ移動しました。','音源未登録時は「音源ファイルを選択」、保存済みなら「音源を変更」に切り替わります。','音源状態に応じた案内文をボタン横へ表示します。']},
    {version:'0.8.83',title:'ライブ準備画面の導線を改善',items:['LIVE START後の準備画面に「楽曲選択へ戻る」ボタンを追加しました。','現在選択中の楽曲名を大きく表示し、どの曲を準備しているか分かりやすくしました。','実際のプレイ中HUDは変更していません。']},
    {version:'0.8.82',title:'ライブ準備画面を一般ユーザー向けに整理',items:['「音源モード」「譜面JSON」など開発用の項目を通常画面から非表示にしました。','初回音源選択は従来どおり自動で開きます。','間違った音源を登録した場合に使える「音源を変更」ボタンを追加しました。','テスト譜面・音源モード・JSON読込の内部機能は削除せず残しています。']},
    {version:'0.8.81',title:'隠し立ち絵と会話ボックスの重なりを調整',items:['隠し立ち絵が会話ボックスより前面に出て文字を隠していた問題を修正しました。','隠し立ち絵は通常立ち絵より上、会話ボックスより下に表示されます。','立ち絵の位置・サイズ・通常立ち絵の非表示処理は変更していません。']},
    {version:'0.8.80',title:'隠し立ち絵の背面重なりを修正',items:['隠し立ち絵表示中に背面へ残っていた通常の栞子立ち絵を非表示にしました。','メイド・水着・剣士選択中は専用立ち絵だけを表示します。','通常へ戻すと既存のステージ/クラシック立ち絵が自動で復帰します。']},
    {version:'0.8.79',title:'隠し立ち絵を専用レイヤー化',items:['メイド・水着・剣士立ち絵を通常立ち絵のsrc差し替えではなく、専用の最前面画像レイヤーで表示する方式へ変更しました。','後から生成されるステージ/クラシック立ち絵に隠される問題を修正しました。','ホーム再表示や立ち絵・表情モード切替後にも隠し立ち絵を再適用します。']},
    {version:'0.8.78',title:'隠し立ち絵の表示優先度を修正',items:['メイド・水着・剣士立ち絵が既存の表情差分処理に上書きされる競合を修正しました。','隠し立ち絵選択中は画像を最優先し、既存セリフモードは会話や演出だけ適用されます。','通常立ち絵へ戻した時は従来の表情差分処理が再び有効になります。']},
    {version:'0.8.77',title:'スピカテリブルの起動経路を一本化',items:['開発用のスピカテリブル専用ショートカットとそのボタン依存を削除しました。','通常の楽曲一覧から直接スピカテリブルの起動処理を呼ぶ構成へ変更しました。','テスト譜面は内部デバッグ用として残しています。']},
    {version:'0.8.76',title:'ライブ画面の開発用ボタンを非表示',items:['ライブ画面に常設されていた「スピカテリブル」「テスト譜面を使う」の開発用ショートカットを非表示にしました。','内部のデバッグ用処理は残しているため、必要になった際の復旧は可能です。','通常の楽曲選択・譜面・音源・ライブ挙動には変更を加えていません。']},
    {version:'0.8.75',title:'選択曲と実際の譜面がずれる問題を修正',items:['楽曲選択画面が古いボタンDOMを保持し、表示中の曲と別の起動処理を呼ぶ可能性を修正しました。','LIVE START時に選択中の曲IDとタイトルから現在の最新カードを引き直して、そのボタンだけを実行します。','曲一覧更新時に眩耀夜行カードまで削除していた処理も修正し、HAPPY PARTY TRAINとBoooooom Boooooom Bee!!だけを更新対象に限定しました。']},
    {version:'0.8.72',title:'iPhone / Android共通動作を強化',items:['内蔵曲ごとに譜面と音源キーを対応付け、別の曲の音源が残っている場合はSTARTできないようにしました。','Androidでは初回音源選択をユーザー操作中に開き、選択後はloadedmetadataまで確認してからSTART可能にします。','音源の端末保存に失敗しても、今回選択したファイルではそのままプレイできるようにしました。','ライブ画面は100dvh・Pointer Events・共通クロックを継続使用し、iPhone/Androidで同じゲーム座標と判定処理を使用します。']},
    {version:'0.8.71',title:'Android 13の眩耀夜行を修正',items:['眩耀夜行の譜面をライブ本体へ明示的にセットするよう変更しました。','Android Chromeで初回音源選択がブロックされないよう、LIVE START操作中にファイル選択を開く方式へ変更しました。','音源差し替え時にaudio.load()を呼び、楽曲カードを毎回作り直さないようにしました。']},
    {version:'0.8.70',title:'星の約束バナーの表示位置を調整',items:['横長バナーのサイズ感は維持したまま、表示位置を上寄りへ変更しました。','上段キャラの頭が見切れにくくなるようobject-positionを調整しました。','画像原本・ガチャBGM・ライブ音声・ガチャ演出には変更を加えていません。']},
    {version:'0.8.69',title:'星の約束バナーを横長表示へ調整',items:['iPhone横画面でバナーが小さく中央表示されていたため、右側領域いっぱいに広がるレイアウトへ変更しました。','正常な原本画像はそのまま使用し、縦横比を崩さず中央基準で上下のみトリミングしています。','ガチャBGM・ライブ音声・ガチャ演出には変更を加えていません。']},
    {version:'0.8.68',title:'星の約束バナーの原画像を修復',items:['正常な完成画像から新しいJPEGを作成しました。','単一画像を元の比率で表示し、旧バナー用CSSの重複を整理しました。','ガチャBGM・ライブ音声の処理は変更していません。']},
    {version:'0.8.67',title:'ガチャバナーを4分割描画へ変更',items:['iPhoneで大きな1枚画像がブロック状に乱れる問題への追加対策として、完成バナーを4分割JPEGで表示する方式へ変更しました。','4枚は隙間なく連結するため、見た目は1枚の完成バナーのままです。','ガチャBGMのマナーモード対応はそのまま維持しています。']},
    {version:'0.8.66',title:'ガチャバナー描画とマナーモード対応を修正',items:['iPhone Safariでバナーがブロック状に乱れる問題に対し、固定バナー時の疑似レイヤー・フィルタ・object-fit合成を外して描画を簡素化しました。','ガチャBGMをHTMLAudioからWeb Audioへ変更し、iPhoneのRing/Silentに従うambientセッションで再生するよう変更しました。','ライブ側の音声方式・設定は変更していません。']},
    {version:'0.8.65',title:'ガチャバナーの表示乱れを修正',items:['iPhoneで「星の約束」バナーがブロック状に乱れる問題を修正しました。','元の完成バナーをSafari互換性の高いJPEGへ変換し、表示先を差し替えました。','レイアウトやガチャBGMには変更を加えていません。']},
    {version:'0.8.64',title:'ガチャ画面にオリジナルBGMを追加',items:['ガチャ画面専用のオリジナルループBGM「Starry Scout Loop」を追加しました。','勧誘画面を開くとフェードインし、ホームへ戻るとフェードアウトして停止します。','iPhoneの再生制限に配慮し、勧誘ボタン操作の流れの中で再生を開始する方式にしています。']},
    {version:'0.8.63',title:'「星の約束」バナーを完成ビジュアルへ差し替え',items:['ガチャのピックアップバナーを12人集合の完成ビジュアルへ変更しました。','従来の12枚画像をブラウザで合成するCanvas処理を廃止し、固定バナー1枚を直接表示する方式へ変更しました。','画像内のタイトルを活かすため、従来の重ね文字はバナー表示時に非表示へ変更しました。']},
    {version:'0.8.62',title:'UR演出の表示位置と画質を修正',items:['URキャラ画像が左上へずれる問題を修正しました。','キャラカードを中央・等倍固定にし、ズーム演出を削除しました。','虹色UR GET!、白フラッシュ、光柱、放射レイ、衝撃波、粒子演出はそのまま維持しています。']},
    {version:'0.8.61',title:'ホーム画面のボタン配置を変更',items:['上段を「ライブ・ストーリー・設定」の順に変更しました。','下段を「部室・ラウンジ・勧誘」の順に変更しました。','ボタン画像や各画面への遷移機能はそのまま維持しています。']},
    {version:'0.8.60',title:'UR排出演出を虹色で豪華に刷新',items:['UR GET!を金色から動く虹色グラデーション＋白発光へ変更しました。','UR開封時に暗転、白フラッシュ、虹色光柱、放射レイ、二重衝撃波を追加しました。','星・ダイヤ・音符系の虹色粒子バーストとキャラ登場ズームを追加しました。','演出はCSS主体で、iPhone横向きの負荷を抑える構成にしています。']},
    {version:'0.8.59',title:'ガチャのピックアップ表示を改善',items:['マンスリーソングUR12人全員を使い、1枚の集合バナーを自動生成するようにしました。','バナー内では6人×2段で全員の顔と頭部が見えるよう、排出画像をトリミングせず配置します。','注目UR3枚も排出時と同じ画像を使用し、歩夢を含め首から上が切れない表示へ修正しました。']},
    {version:'0.8.58',title:'ガチャ画面をステージ型SCOUTへ刷新',items:['ネイビー・紫・金を基調にしたステージ風のガチャロビーへ刷新しました。','中央にピックアップバナー、下部に注目UR3枚を表示する構成へ変更しました。','1回勧誘と10回勧誘を追加し、既存の封筒開封・UR演出へつながるようにしました。','提供割合・詳細ボタンと左側のスカウトメニューを追加しました。']},
    {version:'0.8.57',title:'眩耀夜行のビジュアルと詳細画面を刷新',items:['眩耀夜行に月夜と水面を描いた新しい正方形ジャケットを追加しました。','楽曲一覧の眩耀夜行にも同じジャケット画像を表示するようにしました。','iPhone横向きでは詳細画面を2カラム化し、ジャケット・曲情報・LIVE STARTまでスクロールなしの1画面に収まるよう最適化しました。']},
    {version:'0.8.56',title:'楽曲カテゴリの並びを調整',items:['ライブ選択画面で「蓮ノ空」と「追加曲」の順番を入れ替えました。','「追加曲」がカテゴリ列の一番右に表示されるようにしました。']},
    {version:'0.8.55',title:'ホームアイコンを高解像度で統一',items:['ライブ・設定・部室・勧誘・ストーリー・ラウンジの6アイコンを1024×1024へ統一しました。','ストーリーを基準に透明余白と見かけサイズを揃え、表示時の大きさの差を改善しました。','旧160px画像は高品質リサイズとシャープ処理を行い、iPhone横向きでのぼやけを軽減しました。']},
    {version:'0.8.54',title:'ホームメニューとラウンジ表示を統一',items:['ホームの6ボタンをストーリーボタン基準の同一サイズへ統一しました。','ラウンジを画像そのものがボタンになる表示へ変更し、3列×2段の配置に整理しました。','各メニューの色分けを保ちながら、iPhone横向きでの見切れ・サイズ差を抑えるよう調整しました。']},
    {version:'0.8.38',title:'HAPPY PARTY TRAIN譜面を再構成',items:['スクフェスEXPERTの配置・密度感を参考に、HAPPY PARTY TRAINのフル尺譜面を作り直しました。','左右2〜3レーンを中心に、裏拍・軸連打・中央寄りトリル・同時押しを増やし、二本指で遊べる範囲に調整しています。','ライブの入力・ゲーム時計・AudioBufferタップ音などVer.0.8.37の安定化部分は変更していません。']},
    {version:'0.8.37',title:'iPhone/PWAのライブ安定性を改善',items:['タップ効果音をHTMLAudioの連続再生から軽量なWebAudio AudioBuffer方式へ変更しました。','シャーン音を残したまま、連続タップ時のタップ不能・コマ送り問題を改善しました。']},
    {version:'0.8.33',title:'ストーリーアイコンを修正',items:['指定された本と羽ペンのアイコンへ統一し、破損画像と古い代替画像への参照を除去しました。']},
    {version:'0.4.6',title:'勧誘演出・マンスリーソング修正',items:[
      'マンスリーソングURのキャラクター画像と名前の対応を、集合画像の左からの並びに合わせて修正しました。',
      'Nはピンクの封筒、URはプレミアムな赤い封筒で表示されるように変更しました。',
      'UR入り10連の特殊演出メッセージを画面中央に大きく表示するよう調整しました。'
    ]},
    {version:'0.4.5',title:'勧誘（ガチャ）を実装',items:['10連勧誘を追加しました。N【音符ロリータ】99%、UR【マンスリーソング】1%です。','UR【マンスリーソング】12人を追加し、初獲得したメンバーは部室に追加されます。','同じメンバーが重複して出ることはありますが、部室への登録はシリーズごとに1人です。','封筒をモチーフにした開封演出と、URが含まれる時の開封前スペシャル演出を追加しました。']},
    {version:'0.4.4',title:'ホーム画像ボタンの表示調整',items:['ライブ・設定・部室・勧誘の4つの画像ボタンを正方形に揃えました。','画像が見切れず全体表示されるように調整しました。']},
    {version:'0.4.3',title:'画像そのものをホームボタン化',items:['ホームの4メニューを画像そのものがボタンになる表示へ変更しました。','重複していた文字ラベルとボタン内の余白を削除しました。']},
    {version:'0.4.2',title:'横向きホーム画面を再構成',items:['横向きスマホで左半分を立ち絵、右半分をお知らせとメニューに再構成しました。','ホームから判定調整を外し、設定内から開く形に整理しました。','キャラ変更を「部室」に変更し、「勧誘」をメニューとして追加しました。','ライブ・設定・部室・勧誘に専用イラストアイコンを追加しました。']},
    {version:'0.4.1',title:'リザルト・ホーム会話を強化',items:['リザルトにランク、FULL COMBO、MAX COMBO、曲ごとのハイスコア、NEW RECORD表示を追加しました。','ホームの栞子にランダム・時間帯・連続タップ・ライブ結果連動のセリフを追加しました。','ホームの吹き出しを追加し、キャラクター連動できる構造にしました。']},
    {version:'0.4.0',title:'内蔵ボイス再生方式を変更',items:['内蔵6音声を個別データとして扱う構成へ変更し、端末追加音声に近い再生経路へ整理しました。']}
  ];

  if(updateBanner){
    const latest=HISTORY[0];const head=updateBanner.querySelector('.update-head');const text=updateBanner.querySelector('.update-text');
    if(head) head.innerHTML=`<span id="updateNew" class="update-new">NEW</span><span class="notice-title">お知らせ</span><span class="notice-version">Ver.${latest.version}</span>`;
    if(text) text.textContent=latest.items.join(' ');
    updateBanner.setAttribute('aria-label','お知らせ・更新履歴を開く');
    let overlay=null;
    const closeHistory=()=>{if(!overlay)return;overlay.hidden=true;document.body.classList.remove('notice-history-open');};
    const openHistory=()=>{
      if(!overlay){
        overlay=document.createElement('div');overlay.className='notice-history-overlay';overlay.hidden=true;
        overlay.innerHTML=`<section class="notice-history-modal" role="dialog" aria-modal="true" aria-labelledby="noticeHistoryTitle"><div class="notice-history-head"><div><div class="notice-history-kicker">ANNOUNCEMENT</div><h2 id="noticeHistoryTitle">お知らせ・更新履歴</h2></div><button class="notice-history-close" type="button" aria-label="閉じる">×</button></div><div class="notice-history-list"></div></section>`;
        document.body.appendChild(overlay);const list=overlay.querySelector('.notice-history-list');
        HISTORY.forEach((entry,index)=>{const card=document.createElement('article');card.className='notice-history-card'+(index===0?' is-latest':'');card.innerHTML=`<div class="notice-history-version-row"><strong>Ver.${entry.version}</strong>${index===0?'<span>最新</span>':''}</div><h3>${entry.title}</h3><ul>${entry.items.map(item=>`<li>${item}</li>`).join('')}</ul>`;list.appendChild(card);});
        overlay.querySelector('.notice-history-close')?.addEventListener('click',closeHistory);overlay.addEventListener('click',e=>{if(e.target===overlay)closeHistory();});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden)closeHistory();});
      }
      overlay.hidden=false;document.body.classList.add('notice-history-open');
    };
    updateBanner.addEventListener('click',openHistory);updateBanner.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openHistory();}});
  }
})();