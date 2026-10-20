<!-- author_agent: Claude Code — role: instruction — date: 2026-10-20 — RJ 承認(入口が無く README が自動で読まれていなかったため新設) -->
# ryojisato.org

構成・デザイン・更新手順は README(下に読み込み)。

@README.md

## エージェント向けの要点

- **main への push と PR の merge は即公開**(リポジトリ変数 `SITE_PUBLISH_APPROVED=true` の間、GitHub Actions が GitHub Pages へ出す)。公開は人間専権(hq/HUMAN_ONLY §4)
- 作業はブランチで行い、PR を作るところまで。merge は RJ の明示的な指示があるときだけ
- `.claude/hooks/guard-publish.sh` が main への push・PR merge・公開変数の変更の前に確認を挟む(Claude Code のみ。Codex は対象外)
