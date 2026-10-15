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

## researchmap更新

半年ごとに本人用の「研究者・業績エクスポート」でJSONを書き出し、公開情報だけを確認して反映します。メール等のアカウント情報は書き出し対象から除外します。生の書き出しファイルはGitHubへ追加しません。

2026年10月5日：公式エクスポート24レコードを確認。PublicationsにSophia論文、クリティカルシンキング共著、『日本で出会う世界』『意識の諸相』を追加。Researchに若手研究（25K16060）を追加。新刊と独自の業績説明は保持しました。About・Education・新刊Web付録の本文は据え置きです。

確認事項：researchmapのモナシュ大学在籍期間は2016年12月まで、既存プロフィールのPhD取得年は2017年です。在籍終了と学位授与は異なる可能性があるため、取得年は確認まで変更しません。

旧API用スクリプトは定期実行しません。公開再開には明示的な依頼と `SITE_PUBLISH_APPROVED=true` の設定が必要です。
