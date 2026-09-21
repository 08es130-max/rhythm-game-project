// Ver.0.8.20: lightweight visual-novel style main story.
(function(){
  'use strict';
  const VERSION=window.APP_VERSION||'0.8.20';
  const SAVE_KEY='rhythmGame.storySave.v1';
  const SPEED_KEY='rhythmGame.storyTextSpeed.v1';

  const STORY=[
    {id:'ch01',title:'第1章　はじまりの音',lines:[
      {t:'虹ヶ咲学園へ向かう途中、あなたは偶然、小さなステージの前で足を止めた。'},
      {t:'たった一人で歌っている少女。大きな会場でも、派手な演出でもない。それなのに、目が離せなかった。'},
      {n:'歩夢',t:'そんなに気になった？'},
      {n:'あなた',t:'うん。歌が上手いとか、それだけじゃなくて……胸の奥が熱くなる感じがしたんだ。'},
      {t:'翌日、あなたと歩夢はスクールアイドル同好会を訪ねる。だが、そこにあったのは閉ざされた部室と、活動をやめたメンバーたちだった。'},
      {n:'かすみ',t:'終わってなんかいませんから！'},
      {t:'その言葉に、昨日見たステージが重なる。好きなものを、好きだと言える場所。それがなくなるのは寂しい。'},
      {n:'あなた',t:'だったら、もう一度始めよう。歌いたい人が歌える場所を、もう一度作りたい。'},
      {t:'それが、すべての始まりだった。'}
    ]},
    {id:'ch02',title:'第2章　違うから、並べる',lines:[
      {t:'戻ってきたメンバーたちは、最初から一つになれたわけではなかった。'},
      {t:'かわいさを追いかけるかすみ。演劇と歌を重ねるしずく。自分の魅力を磨く果林。楽しいことを大切にする愛。'},
      {t:'彼方、せつ菜、エマ、璃奈、そして歩夢。それぞれが違う理由でステージに立っていた。'},
      {n:'あなた',t:'みんな、ほんとうに違うね。'},
      {n:'愛',t:'いいじゃん！　それがニジガクってことで！'},
      {t:'同じ衣装で、同じ夢を見る必要はない。ライバルだけれど仲間。仲間だけれどライバル。'},
      {n:'歩夢',t:'あなたが応援してくれるなら……私、やってみたい。'},
      {n:'あなた',t:'もちろん。でも、いつかは自分のためにも歌ってほしいな。'},
      {n:'歩夢',t:'うん。そうなれるように、やってみる。'}
    ]},
    {id:'ch03',title:'第3章　届いた先に',lines:[
      {t:'活動を続けるうち、ニジガクのステージを見てくれる人は少しずつ増えていった。'},
      {n:'あなた',t:'もっとたくさんのスクールアイドルが、自分の「好き」を持ち寄れるお祭りを作れないかな。'},
      {t:'その思いつきが、スクールアイドルフェスティバルという夢へ育っていく。'},
      {t:'μ’sやAqoursとの交流を通して、憧れの存在にも迷いや失敗があったことを知る。'},
      {n:'穂乃果',t:'楽しいって思ったなら、まずやってみればいいんじゃない？'},
      {n:'千歌',t:'最初からすごいことなんてできないよ。だから面白いんだと思う！'},
      {t:'帰りの電車。ノートには会場、参加者、運営――足りないものばかりが増えていく。'},
      {n:'あなた',t:'それでも、やろう。みんなで。'}
    ]},
    {id:'ch04',title:'第4章　正しさだけでは届かない',lines:[
      {t:'フェスへ向けて動き始めた同好会の前に、三船栞子が現れる。'},
      {n:'栞子',t:'努力を否定するつもりはありません。ですが、適性を無視することが本当に本人のためでしょうか。'},
      {t:'かすみとせつ菜は反発する。だが、あなたには栞子が誰かを傷つけるために言っているようには見えなかった。'},
      {n:'あなた',t:'栞子ちゃんは、失敗したことある？'},
      {n:'栞子',t:'当然あります。'},
      {n:'あなた',t:'その時、やらなきゃよかったって思った？'},
      {n:'栞子',t:'……質問の意図が分かりません。'},
      {n:'あなた',t:'私もまだ分かってない。だから、一緒に考えない？'},
      {t:'その日から栞子は、少しずつ同好会の活動を見るようになる。'}
    ]},
    {id:'ch05',title:'第5章　心を動かすもの',lines:[
      {t:'フェスの準備は問題だらけだった。それでも、誰かが困れば別の誰かが手を差し伸べる。'},
      {t:'やがて栞子も運営を手伝うようになり、舞台袖から同好会のライブを見つめていた。'},
      {n:'栞子',t:'以前の私は、結果を先に決めすぎていたのかもしれません。'},
      {n:'あなた',t:'結果？'},
      {n:'栞子',t:'向いているか、向いていないか。それだけで人の道を判断しようとしていました。'},
      {n:'栞子',t:'ですが……挑戦したからこそ生まれるものも、あるのですね。'},
      {t:'しばらくして、栞子は自分から同好会の前へ立つ。'},
      {n:'栞子',t:'私も、試してみたいことがあります。スクールアイドルを。'},
      {t:'同好会は、新しい仲間を迎えた。'}
    ]},
    {id:'ch06',title:'第6章　新しい風',lines:[
      {t:'平穏は長く続かなかった。鐘嵐珠とミア・テイラーの登場が、虹ヶ咲の空気を変える。'},
      {n:'ランジュ',t:'最高の環境で、最高のパフォーマンスをすればいいじゃない。'},
      {t:'設備もスタッフも練習環境も、同好会とは比較にならないほど整っている。だからこそ、誰も簡単には否定できなかった。'},
      {t:'より高い場所へ行きたい。もっと自分を試したい。そんな迷いが同好会の中にも生まれる。'},
      {n:'あなた',t:'選ぶのは、それぞれでいいと思う。'},
      {n:'かすみ',t:'でも……！'},
      {n:'あなた',t:'離れたら仲間じゃなくなるわけじゃないよ。ニジガクは、最初から同じ道だけを歩く場所じゃなかったから。'},
      {t:'ただ、誰より堂々としているランジュの笑顔に、ときどき寂しさが混じることだけが気になっていた。'}
    ]},
    {id:'ch07',title:'第7章　ふたつの場所',lines:[
      {t:'同好会と新しいスクールアイドル部。二つの場所は競い、時にはぶつかりながら、それぞれの答えを探していく。'},
      {t:'しずくは表現を、果林は自分の限界を、愛は人とのつながりを見つめ直す。'},
      {t:'一方、ミアには誰にも見せていない焦りがあった。'},
      {n:'璃奈',t:'ミアちゃん。曲を作るの、楽しい？'},
      {n:'ミア',t:'何が言いたいの？'},
      {n:'璃奈',t:'私も、できることと、やりたいことが同じじゃない時があるから。'},
      {t:'才能があるから。期待されているから。それだけで進み続けるには、人の心は少し複雑すぎる。'}
    ]},
    {id:'ch08',title:'第8章　小さな声',lines:[
      {t:'無理を重ねたミアは、ついに倒れてしまう。目を覚ました彼女のそばにいたのは璃奈だった。'},
      {n:'ミア',t:'どうしてここにいるの。'},
      {n:'璃奈',t:'見つけたから。それで十分だと思う。'},
      {n:'ミア',t:'ボクは天才なんだ。いい曲も書ける。……なのに、怖いんだ。'},
      {t:'期待に応えられなくなること。「天才」という言葉がなくなった時、自分に何が残るのか。'},
      {n:'璃奈',t:'じゃあ、天才じゃないミアちゃんとも友達になる。'},
      {n:'ミア',t:'何それ。'},
      {n:'璃奈',t:'私は、その方がいい。'},
      {t:'そしてランジュもまた、自分が欲しかったのは称賛ではなく「一緒にいたい」と言ってくれる誰かなのだと気づき始める。'}
    ]},
    {id:'ch09',title:'第9章　選び直せる場所',lines:[
      {t:'対立は、勝敗だけでは終わらなかった。'},
      {t:'ランジュは自分のやり方だけが唯一ではないと知り、ミアは誰かの期待ではなく、自分が届けたい音を探し始める。'},
      {t:'栞子もまた、「正解を一つに決めてしまう癖」と向き合っていた。'},
      {n:'あなた',t:'戻るとか、負けるとかじゃなくていいんじゃない？'},
      {n:'ランジュ',t:'じゃあ何よ。'},
      {n:'あなた',t:'選び直すだけ。昨日選んだ道を、今日変えたっていい。'},
      {t:'やがて三人は、それぞれの形で同好会と肩を並べる。'},
      {t:'集合写真は前より人数が多く、少しだけ騒がしい。完成したのではない。また、新しく始まったのだ。'}
    ]},
    {id:'ch10',title:'第10章　夢を届ける人',lines:[
      {t:'活動が落ち着くと、あなたはスクールアイドルの魅力を伝えるファンサイトに力を入れるようになる。'},
      {t:'ステージに立つ人だけではなく、応援する人にも物語がある。それをもっと遠くへ届けたかった。'},
      {n:'歩夢',t:'最近、ちゃんと寝てる？'},
      {n:'あなた',t:'……そこそこ。'},
      {n:'歩夢',t:'その答えは、寝てない人の答えだよ。'},
      {t:'応援することに夢中になりすぎて、自分自身を置き去りにしていたことに気づく。'},
      {n:'歩夢',t:'あなたが私たちを応援してくれたみたいに、私たちだってあなたを応援したいんだよ。'},
      {t:'あなたもまた、この物語の中にいる。'}
    ]},
    {id:'ch11',title:'第11章　近すぎて見えないもの',lines:[
      {t:'教育実習で虹ヶ咲へ戻ってきた薫子。自由奔放な姉に、栞子は珍しく感情を露わにする。'},
      {n:'栞子',t:'姉さんはいつもそうです。私の話を最後まで聞かずに……。'},
      {n:'彼方',t:'言葉だけで伝わらないなら、栞子ちゃんらしい方法を探してみたら？'},
      {t:'かつてスクールアイドルの意味を理解できなかった栞子は、今なら知っている。言葉では届かない想いを、ステージなら届けられることがある。'},
      {t:'ライブが終わったあと、薫子はしばらく黙って妹を見つめる。'},
      {n:'薫子',t:'ずいぶん変わったね。'},
      {n:'栞子',t:'変わったのではありません。知らなかった自分を、知っただけです。'},
      {t:'姉妹の距離は完全になくならない。それでも、互いを勝手に決めつけることはなくなった。'}
    ]},
    {id:'ch12',title:'第12章　知らない誰かの夢',lines:[
      {t:'ある日、海外から一人の少女が虹ヶ咲を訪れる。スクールアイドルに憧れながら、自分がステージに立つことには自信がなかった。'},
      {n:'あなた',t:'一日だけでも、スクールアイドルを体験できるイベントをやってみない？'},
      {t:'誰かが適性を決めるのではなく、本人が自分で確かめるための場所。'},
      {n:'栞子',t:'以前の私でしたら、先に適性を調べようとしていたでしょうね。'},
      {n:'あなた',t:'今は？'},
      {n:'栞子',t:'本人が決めることだと思います。'},
      {t:'イベント当日。少女のライブは完璧ではなかった。それでも、最後には笑っていた。'},
      {t:'夢は叶ったかどうかだけで価値が決まるものではない。夢を持った瞬間から、人は少し前へ進んでいる。'}
    ]},
    {id:'ch13',title:'第13章　私の夢',lines:[
      {t:'いつの間にか、あなたは多くのスクールアイドルと関わるようになっていた。'},
      {n:'歩夢',t:'あなた自身は、これからどうしたいの？'},
      {t:'すぐには答えられなかった。ずっと誰かの夢を応援して、自分の夢を考えることを後回しにしていたから。'},
      {t:'音楽を作ること。ステージを支えること。人と人をつなぐこと。どれも好きだった。'},
      {t:'部室に残り、これまでのライブ写真を眺める。最初は数人だった画面に、今は収まりきらないほどの仲間がいる。'},
      {n:'あなた',t:'「好き」という気持ちが、別の誰かの「好き」を生む瞬間を、もっと遠くへ届けたい。'},
      {t:'翌日、あなたは皆に自分の夢を話す。今度は、あなたが応援される番だった。'}
    ]},
    {id:'ch14',title:'第14章　もう一度、お祭りを',lines:[
      {t:'最初のフェスから時間が経った。だからこそ、同じことをもう一度やるだけでは意味がない。'},
      {n:'あなた',t:'今度は、見る人も参加できるフェスにしたい。'},
      {t:'街のあちこちに小さなステージを作る。歌う人、踊る人、絵を描く人、衣装を作る人、応援する人。'},
      {t:'誰もが、自分の「好き」を持ち寄れる一日。'},
      {t:'準備は当然のように大混乱した。けれど、以前と違うことが一つだけある。'},
      {n:'愛',t:'こっちは任せて！'},
      {n:'栞子',t:'次の会場は私たちが確認します。あなたは少し休んでください。'},
      {t:'あなたが支えてきた人たちが、今はあなたを支えている。そのことが、少しだけ嬉しかった。'}
    ]},
    {id:'ch15',title:'第15章　虹をつなぐ歌',lines:[
      {t:'フェス当日。小さなステージから大きなステージまで、街のあちこちから音楽が聞こえてくる。'},
      {t:'初めて歌う子。何度も舞台を経験した子。客席で応援する人。衣装を直す人。写真を撮る人。誰もが、それぞれの場所で輝いていた。'},
      {n:'かすみ',t:'ここまで来たら、最高にかわいいところ見せますよ！'},
      {n:'愛',t:'最後まで楽しんだもん勝ちっしょ！'},
      {t:'ランジュは胸を張り、ミアは呆れながら笑い、璃奈は静かに頷く。'},
      {n:'栞子',t:'始まりましたね。'},
      {n:'あなた',t:'終わるところじゃなくて？'},
      {n:'栞子',t:'ええ。ここまで来たことで、また次にできることが増えましたから。'},
      {t:'夢はゴールではない。一つ叶えば、その先が見える。誰かの歌を聞いて、誰かが憧れ、その人がまた誰かを動かす。'},
      {t:'最初の日に感じた小さなときめきは、いくつもの色をつなぎながら、こんなにも遠くまで届いた。'},
      {t:'音楽が鳴る。歓声が上がる。今度は、この景色を見た誰かが始める番だ。'},
      {t:'そして物語は――まだ、続いていく。'}
    ]}
  ];

  const css=`
  .home-menu-story{grid-column:1/-1!important;width:100%!important;height:54px!important;max-width:none!important;aspect-ratio:auto!important;border-radius:16px!important;line-height:1!important;background:linear-gradient(105deg,rgba(15,118,110,.96),rgba(56,189,248,.92),rgba(139,92,246,.92))!important;box-shadow:0 10px 24px rgba(14,116,144,.28)!important;color:#fff!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:11px!important;font-weight:900!important;letter-spacing:.08em!important;font-size:16px!important}
  .home-menu-story::before{content:'✦';font-size:20px}.home-menu-story small{font-size:9px;letter-spacing:.18em;opacity:.82;font-weight:800}.home-menu-story .story-home-copy{display:flex;flex-direction:column;gap:2px;line-height:1.05}
  @media (orientation:landscape) and (pointer:coarse){.home-menu{grid-template-rows:1fr 1fr 48px!important}.home-menu-story{height:48px!important;min-height:48px!important;font-size:13px!important;border-radius:12px!important}.home-menu-story::before{font-size:17px}.home-menu-story small{font-size:7px}}
  .story-overlay[hidden]{display:none!important}.story-overlay{position:fixed;inset:0;z-index:12000;color:#fff;background:#07111f;font-family:inherit;overflow:hidden}.story-scene{position:absolute;inset:0;background:radial-gradient(circle at 24% 18%,rgba(125,211,252,.18),transparent 30%),radial-gradient(circle at 76% 38%,rgba(244,114,182,.13),transparent 32%),linear-gradient(145deg,#10233e,#0d1729 48%,#09111f);overflow:hidden}.story-scene::before{content:'';position:absolute;inset:0;opacity:.28;background-image:radial-gradient(circle,#fff 0 1px,transparent 1.5px);background-size:42px 42px;mask-image:linear-gradient(to bottom,#000,transparent 72%)}
  .story-top{position:absolute;left:0;right:0;top:0;z-index:3;display:flex;align-items:center;justify-content:space-between;padding:max(9px,env(safe-area-inset-top)) 14px 8px;background:linear-gradient(180deg,rgba(2,6,23,.88),transparent)}.story-title{min-width:0;font-size:13px;font-weight:900;text-shadow:0 2px 10px #000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.story-top-actions{display:flex;align-items:center;gap:8px}.story-home-quick{position:absolute;left:max(14px,env(safe-area-inset-left));top:max(8px,env(safe-area-inset-top));z-index:2}.story-menu-btn{margin-left:auto}.story-menu-btn,.story-home-quick{border:1px solid rgba(255,255,255,.4);border-radius:999px;background:rgba(15,23,42,.78);color:#fff;padding:7px 13px;font-weight:900;font-size:11px;letter-spacing:.08em}.story-home-quick{border-color:rgba(125,211,252,.58);background:rgba(3,105,161,.72)}
  .story-chapters{position:absolute;inset:0;z-index:2;overflow:auto;padding:66px 16px 24px;background:linear-gradient(180deg,rgba(7,17,31,.36),rgba(7,17,31,.82))}.story-chapter-head{max-width:840px;margin:0 auto 14px}.story-chapter-kicker{font-size:10px;letter-spacing:.22em;color:#7dd3fc;font-weight:900}.story-chapter-head h2{margin:4px 0 4px;font-size:24px}.story-chapter-head p{margin:0;color:#cbd5e1;font-size:11px}.story-chapter-grid{max-width:840px;margin:0 auto;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.story-chapter-card{position:relative;text-align:left;border:1px solid rgba(125,211,252,.25);border-radius:16px;background:linear-gradient(135deg,rgba(15,23,42,.9),rgba(30,41,59,.72));color:#fff;padding:14px 14px 13px;min-height:72px;box-shadow:0 10px 26px rgba(0,0,0,.18)}.story-chapter-card:active{transform:scale(.985)}.story-chapter-card strong{display:block;font-size:13px;line-height:1.35}.story-chapter-card span{display:block;margin-top:5px;color:#93c5fd;font-size:9px;letter-spacing:.1em}.story-chapter-card.is-saved::after{content:'SAVE';position:absolute;right:9px;top:8px;padding:2px 6px;border-radius:999px;background:#22d3ee;color:#083344;font-size:7px;font-weight:900}
  .story-reader[hidden]{display:none!important}.story-reader{position:absolute;inset:0;z-index:2}.story-backdrop-title{position:absolute;left:50%;top:43%;transform:translate(-50%,-50%);width:min(82vw,760px);text-align:center;color:rgba(255,255,255,.12);font-size:clamp(22px,5vw,52px);font-weight:1000;letter-spacing:.08em;pointer-events:none}.story-message-wrap{position:absolute;z-index:4;left:4%;right:4%;bottom:max(4%,env(safe-area-inset-bottom));min-height:28%;display:flex;align-items:stretch}.story-message{position:relative;width:100%;border:3px solid rgba(255,255,255,.86);border-radius:18px 18px 28px 28px;background:linear-gradient(180deg,rgba(248,250,252,.96),rgba(224,242,254,.94));box-shadow:0 18px 55px rgba(0,0,0,.42),inset 0 0 0 2px rgba(14,165,233,.28);color:#172033;padding:29px 30px 24px;font-size:clamp(14px,2.2vw,21px);font-weight:700;line-height:1.75;cursor:pointer;user-select:none;-webkit-user-select:none}.story-message::after{content:'▼';position:absolute;right:18px;bottom:8px;color:#0284c7;font-size:11px;animation:storyBlink 1s steps(2,end) infinite}.story-nameplate{position:absolute;z-index:2;right:18px;top:-20px;min-width:116px;max-width:42%;padding:7px 15px;border:2px solid #fff;border-radius:12px 12px 5px 5px;background:linear-gradient(90deg,#0ea5e9,#8b5cf6);box-shadow:0 5px 14px rgba(0,0,0,.3);text-align:center;color:#fff;font-size:13px;font-weight:1000}.story-nameplate[hidden]{display:none!important}.story-progress{position:absolute;left:14px;bottom:8px;color:#64748b;font-size:8px;font-weight:800}.story-click-area{position:absolute;inset:54px 0 0;z-index:1}
  @keyframes storyBlink{50%{opacity:.2}}
  .story-menu-overlay[hidden],.story-backlog[hidden]{display:none!important}.story-menu-overlay,.story-backlog{position:absolute;inset:0;z-index:20;background:rgba(2,6,23,.78);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);display:flex;align-items:center;justify-content:center;padding:14px}.story-menu-panel,.story-backlog-panel{width:min(560px,94vw);max-height:86dvh;overflow:auto;border:1px solid rgba(125,211,252,.35);border-radius:22px;background:linear-gradient(180deg,#111c31,#0b1322);box-shadow:0 28px 80px rgba(0,0,0,.5);padding:18px}.story-menu-panel h3,.story-backlog-panel h3{margin:0 0 14px;font-size:19px}.story-menu-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.story-menu-action{border:1px solid rgba(148,163,184,.28);border-radius:13px;background:#1e293b;color:#fff;padding:12px 10px;font-weight:800;font-size:12px}.story-menu-action.primary{background:linear-gradient(100deg,#0e7490,#2563eb)}.story-speed{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 12px;border-radius:13px;background:#0f172a;font-size:11px}.story-speed select{min-width:110px;padding:7px;border-radius:9px;background:#1e293b;color:#fff;border:1px solid #475569}.story-menu-close{margin-top:12px;width:100%;border:0;border-radius:13px;background:rgba(255,255,255,.08);color:#fff;padding:10px;font-weight:800}.story-backlog-list{display:grid;gap:8px}.story-log{padding:9px 10px;border-radius:11px;background:rgba(30,41,59,.82);font-size:11px;line-height:1.5;color:#e2e8f0}.story-log strong{color:#7dd3fc;margin-right:8px}.story-toast{position:absolute;z-index:30;left:50%;top:16%;transform:translateX(-50%);padding:8px 14px;border-radius:999px;background:rgba(15,23,42,.94);border:1px solid rgba(125,211,252,.35);font-size:10px;font-weight:900;opacity:0;pointer-events:none;transition:opacity .18s}.story-toast.show{opacity:1}
  @media (orientation:landscape) and (pointer:coarse){.story-chapters{padding-top:48px}.story-chapter-head{margin-bottom:7px}.story-chapter-head h2{font-size:16px}.story-chapter-head p{font-size:8px}.story-chapter-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.story-chapter-card{min-height:45px;padding:7px 9px;border-radius:11px}.story-chapter-card strong{font-size:9px}.story-chapter-card span{font-size:7px;margin-top:2px}.story-top{padding:6px 9px}.story-title{font-size:9px}.story-menu-btn{padding:5px 9px;font-size:8px}.story-message-wrap{left:3%;right:3%;bottom:3%;min-height:32%}.story-message{padding:19px 20px 15px;font-size:12px;line-height:1.55;border-radius:13px 13px 20px 20px}.story-nameplate{right:12px;top:-15px;min-width:88px;padding:4px 10px;font-size:9px}.story-progress{font-size:6px;bottom:5px}.story-menu-panel,.story-backlog-panel{max-height:92dvh;padding:11px;border-radius:15px}.story-menu-panel h3,.story-backlog-panel h3{font-size:13px;margin-bottom:8px}.story-menu-action{padding:8px;font-size:9px}.story-speed{padding:7px 8px;font-size:8px}.story-backlog-list{gap:5px}.story-log{padding:6px 7px;font-size:8px}}
  @media (max-width:720px) and (orientation:portrait){.story-chapter-grid{grid-template-columns:1fr}.story-message-wrap{left:12px;right:12px;bottom:max(18px,env(safe-area-inset-bottom))}.story-message{padding:26px 18px 22px;font-size:15px;line-height:1.65}.story-nameplate{right:12px}.story-menu-grid{grid-template-columns:1fr}}
  `;
  if(!document.getElementById('storyV086Style')){const s=document.createElement('style');s.id='storyV086Style';s.textContent=css;document.head.appendChild(s);}

  const menu=document.querySelector('.home-menu');
  if(menu&&!document.getElementById('homeStoryBtn')){
    const b=document.createElement('button');b.id='homeStoryBtn';b.type='button';b.className='home-menu-btn home-menu-story';b.setAttribute('aria-label','ストーリー');b.innerHTML='<span class="story-home-copy"><small>MAIN STORY</small><span>ストーリー</span></span>';menu.appendChild(b);
  }

  let overlay=document.getElementById('storyOverlay');
  if(!overlay){
    overlay=document.createElement('section');overlay.id='storyOverlay';overlay.className='story-overlay';overlay.hidden=true;
    overlay.innerHTML=`<div class="story-scene"><div class="story-top"><div id="storyTopTitle" class="story-title">MAIN STORY ― 虹をつなぐ歌 ―</div><div class="story-top-actions"><button id="storyQuickHomeBtn" class="story-home-quick" type="button">ホーム</button><button id="storyMenuBtn" class="story-menu-btn" type="button">メニュー</button></div></div><div id="storyChapters" class="story-chapters"><div class="story-chapter-head"><div class="story-chapter-kicker">MAIN STORY</div><h2>虹をつなぐ歌</h2><p>章を選んでストーリーを読みます。途中経過はMENUから保存できます。</p></div><div id="storyChapterGrid" class="story-chapter-grid"></div></div><div id="storyReader" class="story-reader" hidden><div id="storyBackdropTitle" class="story-backdrop-title"></div><div class="story-click-area" aria-hidden="true"></div><div class="story-message-wrap"><div id="storyMessage" class="story-message" role="button" tabindex="0"><div id="storyNameplate" class="story-nameplate" hidden></div><div id="storyText"></div><div id="storyProgress" class="story-progress"></div></div></div></div><div id="storyMenuOverlay" class="story-menu-overlay" hidden><div class="story-menu-panel"><h3>ストーリーメニュー</h3><div class="story-menu-grid"><button id="storySaveBtn" class="story-menu-action primary" type="button">セーブ</button><button id="storyLoadBtn" class="story-menu-action" type="button">ロード</button><button id="storyAutoBtn" class="story-menu-action" type="button">オート：OFF</button><button id="storyBacklogBtn" class="story-menu-action" type="button">バックログ</button><div class="story-speed"><span>メッセージ表示速度</span><select id="storySpeed"><option value="45">ゆっくり</option><option value="26">普通</option><option value="12">速い</option><option value="0">一括表示</option></select></div><button id="storyChapterBtn" class="story-menu-action" type="button">章選択へ</button><button id="storyHomeBtn" class="story-menu-action" type="button">ホームへ戻る</button></div><button id="storyMenuClose" class="story-menu-close" type="button">閉じる</button></div></div><div id="storyBacklog" class="story-backlog" hidden><div class="story-backlog-panel"><h3>バックログ</h3><div id="storyBacklogList" class="story-backlog-list"></div><button id="storyBacklogClose" class="story-menu-close" type="button">戻る</button></div></div><div id="storyToast" class="story-toast"></div></div>`;
    document.body.appendChild(overlay);
  }

  const $=id=>document.getElementById(id);
  const chapters=$('storyChapters'),grid=$('storyChapterGrid'),reader=$('storyReader'),topTitle=$('storyTopTitle'),backdrop=$('storyBackdropTitle'),message=$('storyMessage'),nameplate=$('storyNameplate'),text=$('storyText'),progress=$('storyProgress'),menuOverlay=$('storyMenuOverlay'),backlogOverlay=$('storyBacklog'),backlogList=$('storyBacklogList'),speedSelect=$('storySpeed'),toast=$('storyToast');
  let chapterIndex=0,lineIndex=0,timer=null,typing=false,fullText='',auto=false,autoTimer=null,log=[];

  function saved(){try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'null');}catch(_){return null;}}
  function toastMsg(v){toast.textContent=v;toast.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>toast.classList.remove('show'),1200);}
  function renderChapters(){
    const sv=saved();grid.innerHTML='';STORY.forEach((ch,i)=>{const b=document.createElement('button');b.type='button';b.className='story-chapter-card'+(sv?.chapterId===ch.id?' is-saved':'');b.innerHTML=`<strong>${ch.title}</strong><span>${ch.lines.length} MESSAGE</span>`;b.addEventListener('click',()=>openChapter(i,0));grid.appendChild(b);});
  }
  function openStory(){overlay.hidden=false;document.body.style.overflow='hidden';showChapters();}
  function closeStory(){clearType();clearTimeout(autoTimer);auto=false;overlay.hidden=true;menuOverlay.hidden=true;backlogOverlay.hidden=true;document.body.style.overflow='';}
  function showChapters(){clearType();clearTimeout(autoTimer);chapters.hidden=false;reader.hidden=true;menuOverlay.hidden=true;backlogOverlay.hidden=true;topTitle.textContent='MAIN STORY ― 虹をつなぐ歌 ―';renderChapters();}
  function openChapter(ci,li){chapterIndex=Math.max(0,Math.min(STORY.length-1,ci));lineIndex=Math.max(0,Math.min(STORY[chapterIndex].lines.length-1,li));chapters.hidden=true;reader.hidden=false;menuOverlay.hidden=true;backlogOverlay.hidden=true;topTitle.textContent=STORY[chapterIndex].title;backdrop.textContent=STORY[chapterIndex].title.replace(/^第\d+章\s*/,'');log=[];showLine();}
  function clearType(){if(timer){clearInterval(timer);timer=null;}typing=false;}
  function showLine(){
    clearType();clearTimeout(autoTimer);const ch=STORY[chapterIndex],ln=ch.lines[lineIndex];if(!ln){showChapters();return;}
    nameplate.hidden=!ln.n;nameplate.textContent=ln.n||'';fullText=ln.t;text.textContent='';progress.textContent=`${chapterIndex+1}/${STORY.length}　${lineIndex+1}/${ch.lines.length}`;
    log.push({n:ln.n||'',t:ln.t});if(log.length>80)log.shift();
    const sp=Number(speedSelect.value||26);if(sp===0){text.textContent=fullText;typing=false;scheduleAuto();return;}
    let p=0;typing=true;timer=setInterval(()=>{p++;text.textContent=fullText.slice(0,p);if(p>=fullText.length){clearType();scheduleAuto();}},sp);
  }
  function scheduleAuto(){if(!auto)return;clearTimeout(autoTimer);autoTimer=setTimeout(()=>advance(),1300+Math.min(2600,fullText.length*32));}
  function advance(){
    if(typing){clearType();text.textContent=fullText;scheduleAuto();return;}
    const ch=STORY[chapterIndex];if(lineIndex<ch.lines.length-1){lineIndex++;showLine();}else{toastMsg('章を読み終えました');setTimeout(showChapters,650);}
  }
  function saveNow(){const ch=STORY[chapterIndex];localStorage.setItem(SAVE_KEY,JSON.stringify({chapterId:ch.id,lineIndex,updatedAt:Date.now()}));renderChapters();toastMsg('セーブしました');}
  function loadNow(){const sv=saved();if(!sv){toastMsg('セーブデータがありません');return;}const ci=STORY.findIndex(x=>x.id===sv.chapterId);if(ci<0){toastMsg('セーブデータを読み込めません');return;}openChapter(ci,Number(sv.lineIndex)||0);toastMsg('ロードしました');}
  function openMenu(){menuOverlay.hidden=false;clearTimeout(autoTimer);}
  function closeMenu(){menuOverlay.hidden=true;scheduleAuto();}
  function openBacklog(){backlogList.innerHTML='';if(!log.length){backlogList.innerHTML='<div class="story-log">まだ履歴はありません。</div>';}else{log.forEach(x=>{const d=document.createElement('div');d.className='story-log';d.innerHTML=x.n?`<strong>${x.n}</strong>${x.t}`:x.t;backlogList.appendChild(d);});}backlogOverlay.hidden=false;menuOverlay.hidden=true;backlogList.lastElementChild?.scrollIntoView({block:'end'});}

  const storedSpeed=localStorage.getItem(SPEED_KEY);speedSelect.value=['45','26','12','0'].includes(storedSpeed)?storedSpeed:'26';
  speedSelect.addEventListener('change',()=>localStorage.setItem(SPEED_KEY,speedSelect.value));
  $('homeStoryBtn')?.addEventListener('click',openStory);
  $('storyQuickHomeBtn')?.addEventListener('click',closeStory);
  $('storyMenuBtn')?.addEventListener('click',openMenu);
  $('storyMenuClose')?.addEventListener('click',closeMenu);
  $('storySaveBtn')?.addEventListener('click',saveNow);
  $('storyLoadBtn')?.addEventListener('click',loadNow);
  $('storyAutoBtn')?.addEventListener('click',()=>{auto=!auto;$('storyAutoBtn').textContent=`オート：${auto?'ON':'OFF'}`;toastMsg(auto?'オート再生 ON':'オート再生 OFF');if(auto){menuOverlay.hidden=true;scheduleAuto();}});
  $('storyBacklogBtn')?.addEventListener('click',openBacklog);
  $('storyBacklogClose')?.addEventListener('click',()=>{backlogOverlay.hidden=true;menuOverlay.hidden=false;});
  $('storyChapterBtn')?.addEventListener('click',showChapters);
  $('storyHomeBtn')?.addEventListener('click',closeStory);
  message.addEventListener('click',advance);message.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();advance();}});
  document.addEventListener('keydown',e=>{if(overlay.hidden)return;if(e.key==='Escape'){if(!backlogOverlay.hidden){backlogOverlay.hidden=true;menuOverlay.hidden=false;}else if(!menuOverlay.hidden)closeMenu();else openMenu();}});
  renderChapters();
  window.LOVEFES_STORY={open:openStory,close:closeStory,data:STORY,version:VERSION};
})();

/* Ver.0.8.118: use the Settings Home button form and reserve title space. */
.story-home-quick{
  border:0!important;
  border-radius:12px!important;
  padding:10px 14px!important;
  font-weight:800!important;
  background:#e2e8f0!important;
  color:#0f172a!important;
  box-shadow:none!important;
  letter-spacing:normal!important;
}
.story-top{padding-left:max(92px,calc(env(safe-area-inset-left) + 92px))!important}
@media (orientation:landscape) and (pointer:coarse){
  .story-top{padding-left:max(88px,calc(env(safe-area-inset-left) + 88px))!important}
  .story-home-quick{padding:10px 14px!important;font-size:10px!important}
}
