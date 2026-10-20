#!/bin/bash
# author_agent: Claude Code — PreToolUse(Bash) hook (2026-10-20, RJ 承認)
# main への push と PR の merge は即公開(SITE_PUBLISH_APPROVED=true の間、Actions が GitHub Pages へ出す)。
# 公開は人間専権(hq/HUMAN_ONLY §4)なので、実行前に RJ の確認を挟む(拒否ではなく ask)。
# 対象: main へ届く git push / gh pr merge / 公開変数の変更。ブランチへの push と PR 作成は通す。
branch="$(git -C "${CLAUDE_PROJECT_DIR:-.}" symbolic-ref --short HEAD 2>/dev/null)"
exec python3 -c '
import json, re, shlex, sys
branch = sys.argv[1]
cmd = json.load(sys.stdin).get("tool_input", {}).get("command", "")
def ask(msg):
    print(json.dumps({"hookSpecificOutput": {"hookEventName": "PreToolUse",
        "permissionDecision": "ask", "permissionDecisionReason": msg}}, ensure_ascii=False))
    sys.exit(0)
for seg in re.split(r"&&|\|\||;|\|", cmd):
    try: tok = shlex.split(seg)
    except ValueError: tok = seg.split()
    if len(tok) >= 2 and tok[0] == "git" and tok[1] == "push":
        args = [t for t in tok[2:] if not t.startswith("-")]
        flags = [t for t in tok[2:] if t.startswith("-")]
        refs = args[1:]   # args[0] = remote
        to_main = any(r.split(":")[-1] in ("main", "refs/heads/main") or (r == "HEAD" and branch == "main") for r in refs)
        if not refs and branch == "main": to_main = True
        if "--all" in flags or "--mirror" in flags: to_main = True
        if to_main:
            ask("ryojisato.org: main への push は即公開される(GitHub Pages)。RJ の明示的な指示がある場合だけ承認を。通常はブランチに push して PR にする。")
    if len(tok) >= 3 and tok[0] == "gh" and tok[1] == "pr" and tok[2] == "merge":
        ask("ryojisato.org: PR の merge は即公開される。RJ の明示的な指示がある場合だけ承認を。")
    if tok[:1] == ["gh"] and "SITE_PUBLISH_APPROVED" in seg:
        ask("ryojisato.org: 公開の関門 SITE_PUBLISH_APPROVED の変更。RJ の判断が要る。")
' "$branch"
