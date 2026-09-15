# ryojisato.org

佐藤亮司の研究者個人サイトです。依存関係のない静的HTML/CSS/JavaScriptで構成し、GitHub Pagesで公開します。

## 構成

- `/` — ホーム
- `/about/` — プロフィール
- `/research/` — 研究
- `/education/` — 教育、批判的思考、講演・研修の相談
- `/publications/` — 主な業績
- `/books/` — 著書
- `/books/free-energy-principle/` — 『自由エネルギー原理を哲学する』Web付録

公開ファイルは `dist/` にあります。GitHub Actionsが `main` ブランチへの更新を自動でGitHub Pagesへ反映します。

## researchmap同期

JSTからWeb API利用承認を得た後、GitHubのRepository variablesに `RESEARCHMAP_API_APPROVED=true` を設定すると、毎週月曜に公開済みの「論文」と「書籍等出版物」をresearchmapから取得して業績ページを更新します。承認前はAPIへの定期アクセスは実行されません。

同期元: `https://api.researchmap.jp/ryoji-sato`
