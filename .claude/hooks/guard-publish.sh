#!/bin/bash
# author_agent: Claude Code — PreToolUse(Bash) hook (2026-10-20, RJ 承認)
# main への push と PR の merge は即公開(SITE_PUBLISH_APPROVED=true の間、Actions が GitHub Pages へ出す)。
# 公開は人間専権(hq/HUMAN_ONLY §4)なので、実行前に RJ の確認を挟む(拒否ではなく ask)。
# 対象: main へ届く git push(+main の強制 push、git -C <dir> push を含む) / gh pr merge / 公開変数の変更。ブランチへの push と PR 作成は通す。
exec python3 -c '
import json, os, re, shlex, subprocess, sys
data = json.load(sys.stdin)
cmd = data.get("tool_input", {}).get("command", "")
cwd = data.get("cwd") or os.environ.get("CLAUDE_PROJECT_DIR") or "."
GIT_OPTS_WITH_VALUE = {"-C", "-c", "--git-dir", "--work-tree", "--namespace", "--config-env", "--super-prefix"}
PUSH_OPTS_WITH_VALUE = {"-o", "--push-option", "--repo", "--receive-pack", "--exec"}
def ask(msg):
    print(json.dumps({"hookSpecificOutput": {"hookEventName": "PreToolUse",
        "permissionDecision": "ask", "permissionDecisionReason": msg}}, ensure_ascii=False))
    sys.exit(0)
def branch_of(path):
    r = subprocess.run(["git", "-C", path, "symbolic-ref", "--short", "HEAD"], capture_output=True, text=True)
    return r.stdout.strip()
for seg in re.split(r"&&|\|\||;|\||\n|\(|\)", cmd):
    try: tok = shlex.split(seg)
    except ValueError: tok = seg.split()
    if tok[:1] == ["git"]:
        where, i = cwd, 1   # git -C <dir> などの大域オプションを読み飛ばし、-C は push 先の判定に使う
        while i < len(tok) and tok[i].startswith("-"):
            if tok[i] == "-C" and i + 1 < len(tok):
                where = os.path.join(where, os.path.expanduser(tok[i + 1]))
            i += 2 if tok[i] in GIT_OPTS_WITH_VALUE else 1
        if i < len(tok) and tok[i] == "push":
            args, flags, j = [], [], i + 1
            while j < len(tok):
                if tok[j].startswith("-"):
                    flags.append(tok[j])
                    j += 2 if tok[j] in PUSH_OPTS_WITH_VALUE else 1
                else:
                    args.append(tok[j])
                    j += 1
            refs = [r.lstrip("+") for r in args[1:]]   # args[0] = remote。先頭の + は強制 push の印
            branch = branch_of(where)
            to_main = any(r.split(":")[-1] in ("main", "refs/heads/main") or (r in ("HEAD", "@") and branch == "main") for r in refs)
            if not refs and branch == "main": to_main = True
            if "--all" in flags or "--mirror" in flags: to_main = True
            if to_main:
                ask("ryojisato.org: main への push は即公開される(GitHub Pages)。RJ の明示的な指示がある場合だけ承認を。通常はブランチに push して PR にする。")
    if tok[:1] == ["gh"] and any(tok[k:k + 2] == ["pr", "merge"] for k in range(1, len(tok))):
        ask("ryojisato.org: PR の merge は即公開される。RJ の明示的な指示がある場合だけ承認を。")
    if tok[:1] == ["gh"] and "SITE_PUBLISH_APPROVED" in seg:
        ask("ryojisato.org: 公開の関門 SITE_PUBLISH_APPROVED の変更。RJ の判断が要る。")
'
