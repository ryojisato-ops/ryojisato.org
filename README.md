# ryojisato.org

佐藤亮司の研究者個人サイトです。依存関係のない静的HTML/CSS/JavaScriptで構成し、GitHub Pagesで公開します。

## 構成

- `/` — ホーム
- `/about/` — プロフィール
- `/research/` — 研究
- `/education/` — 教育、生成AIと学び、批判的思考（担当授業はASEサイトへのリンク）
- `/publications/` — 主な業績
- `/books/` — 著書
- `/books/free-energy-principle/` — 『自由エネルギー原理を哲学する』Web付録（トップ、記号対応、正誤表、更新履歴）
- `/books/free-energy-principle/variational-free-energy/` — 付録01 変分自由エネルギー（第1章対応）
- `/books/free-energy-principle/expected-free-energy/` — 付録02 期待自由エネルギー（第4章対応）
- `/en/` 以下 — 英語版（ホーム・プロフィール・研究・教育・業績・著書の6ページ）。Web付録は日本語のみです。

Web付録の原稿は `book publication/web-appendix/site/` で作られたものを、本の用語（複雑性・正確性・サプライズ・Ｔ字迷路など）に合わせて移植しています。付録専用の部品は `dist/assets/appendix.css`、計算機は `dist/assets/fep-calculator.js`（付録01だけが読み込む、サイトで唯一のJavaScript）です。

公開ファイルは `dist/` にあります。GitHub Actionsが `main` ブランチへの更新をGitHub Pagesへ反映します（リポジトリ変数 `SITE_PUBLISH_APPROVED` が `true` のときだけ）。

## デザイン（2026年10月改装）

- 左に袖（名前・肖像・目次）、右に本文一段組（約40字幅）の構成。小さな画面では袖が上部にまとまります。
- 見出しは明朝、本文はゴシック。すべてOS標準フォントで、外部フォントや外部リクエストはありません。
- 見出しや短いラベルは `word-break: keep-all` で、句読点と文節の切れ目（`<wbr>`）でだけ改行します。見出しを足したり書き換えたりしたら `python3 scripts/add-wbr.py` を実行してください（BudouX を使うので先に `python3 -m pip install budoux`。何度実行しても結果は同じです）。
- JavaScriptは付録01の計算機だけです。スタイルは `dist/assets/site.css`（付録ページは `appendix.css` も）です。
- 白地に藍の罫線（原稿用紙の佇まい）。色はすべて `site.css` 冒頭の変数で決めています。
- 肖像は `mix-blend-mode: multiply` で紙色の上に載せています。
- 更新頻度を下げるため、日付つきの「近況」や担当授業の一覧は置いていません。年度で変わる情報は大学側のページへのリンクで済ませます。
- 科研費などの研究課題は個別に掲載せず、researchmap（プロフィールからリンク）に任せます。期限つきの情報で、特定の理論を前面に出すことにもなるためです。
- 業績ページの `<!-- RESEARCHMAP:* -->` マーカーと `pub-item` 系のクラス名は、`scripts/` の取り込みスクリプトが前提にしているため変えないでください。

## 英語版

- 日本語の各ページと `/en/` の対応ページは、`<link rel="alternate" hreflang>` と袖の言語切り替えリンクで相互に結んでいます。ページを追加・削除するときは両方とsitemapをそろえてください。
- 英語版の文章は日本語版の訳です。日本語版を直したら、英語版も合わせて直します。
- 英語の業績ページは手で更新します。researchmapの取り込みスクリプトが書き換えるのは日本語の業績ページだけです。
- 新刊の英題は、カバーに印刷される公式の英題 *Philosophizing the Free Energy Principle: Body, Consciousness, and AI* を使います（2026年9月、勁草書房とのやりとりで確定）。
- そのほかの日本語の書名には、ローマ字表記と［］内の英訳を添えています。［］内は仮訳で、公式の英題ではありません。
- 英語ページの組版は `site.css` の `:lang(en)` で調整しています（行間・行長・字間）。

ローカル確認:

```bash
python3 -m http.server 4173 --directory dist
```

## researchmap更新

半年ごとに本人用の「研究者・業績エクスポート」でJSONを書き出し、公開情報だけを確認して反映します。メール等のアカウント情報は書き出し対象から除外します。生の書き出しファイルはGitHubへ追加しません。

2026年10月5日：公式エクスポート24レコードを確認。PublicationsにSophia論文、クリティカルシンキング共著、『日本で出会う世界』『意識の諸相』を追加。新刊と独自の業績説明は保持しました。About・Education・新刊Web付録の本文は据え置きです。

確認事項：researchmapのモナシュ大学在籍期間は2016年12月まで、既存プロフィールのPhD取得年は2017年です。在籍終了と学位授与は異なる可能性があるため、取得年は確認まで変更しません。

旧API用スクリプトは定期実行しません。公開再開には明示的な依頼と `SITE_PUBLISH_APPROVED=true` の設定が必要です。
