"""見出しなどの日本語に、文節ごとの改行位置（<wbr>）を入れる。

site.css は見出しを word-break: keep-all にしているので、句読点と <wbr> の位置でしか
改行しない。<wbr> がないと、1行に収まらない見出しが行末の任意の位置で折れる。
見出しを足したり書き換えたりしたら、これを実行し直す（何度実行しても結果は同じ）。

    python3 -m pip install budoux
    python3 scripts/add-wbr.py
"""

import re
import sys
from html.parser import HTMLParser
from pathlib import Path

import budoux

DIST = Path(__file__).resolve().parent.parent / "dist"
PARSER = budoux.load_default_japanese_parser()
JA = re.compile(r"[぀-ヿ㐀-鿿]")

TARGET_TAGS = {"h1", "h2", "h3"}
TARGET_CLASSES = {
    "statement", "page-title", "book-title", "book-sub", "kicker", "book-label",
    "title", "pub-title", "label",
}
# 3階層上までのどこかのクラスがこれなら、中の b / strong / dt / dd / td も見出し扱いにする
LABEL_PARENTS = {"compare", "policies", "note", "say", "areas", "dated", "notation"}
SKIP_TAGS = {"var", "script", "style", "title", "code", "head"}
# BudouX の切れ目を手で直すところ（左を右に置き換える）
OVERRIDES = [
    ("手が<wbr>かり", "手がかり"),
    ("なぜKL", "なぜ<wbr>KL"),
    ("「付録を<wbr>参照」", "「付録を参照」"),
]


def phrase_breaks(text):
    if not JA.search(text):
        return text
    parts = PARSER.parse(text)
    out = parts[0]
    for part in parts[1:]:
        if out[-1:].isspace() or part[:1].isspace():
            out += part
        else:
            out += "<wbr>" + part
    for before, after in OVERRIDES:
        out = out.replace(before, after)
    return out


class Rewriter(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.out = []
        self.stack = []  # (tag, classes, attrs)
        self.buf = []

    def in_target(self):
        target = False
        for i, (tag, classes, attrs) in enumerate(self.stack):
            if tag in SKIP_TAGS or attrs.get("aria-hidden") == "true":
                return False
            # <dl><div><dd> や <table><tbody><tr><td> のような入れ子の外側のクラス
            outer = set().union(*(c for _, c, _ in self.stack[max(0, i - 3):i]))
            if (
                tag in TARGET_TAGS
                or classes & TARGET_CLASSES
                or (tag in {"b", "strong", "dt", "dd", "td"} and outer & LABEL_PARENTS)
            ):
                target = True
        return target

    def flush(self):
        if self.buf:
            self.out.append(phrase_breaks("".join(self.buf)))
            self.buf = []

    def handle_starttag(self, tag, attrs):
        if tag == "wbr" and self.in_target():
            return  # 付け直すので既存の <wbr> は捨てる
        self.flush()
        self.out.append(self.get_starttag_text())
        if tag not in {"meta", "link", "img", "br", "wbr", "input", "source", "hr"}:
            attrs = dict(attrs)
            self.stack.append((tag, set((attrs.get("class") or "").split()), attrs))

    def handle_startendtag(self, tag, attrs):
        if tag == "wbr" and self.in_target():
            return
        self.flush()
        self.out.append(self.get_starttag_text())

    def handle_endtag(self, tag):
        self.flush()
        self.out.append(f"</{tag}>")
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        if self.in_target():
            self.buf.append(data)
        else:
            self.out.append(data)

    def handle_entityref(self, name):
        self.flush()
        self.out.append(f"&{name};")

    def handle_charref(self, name):
        self.flush()
        self.out.append(f"&#{name};")

    def handle_comment(self, data):
        self.flush()
        self.out.append(f"<!--{data}-->")

    def handle_decl(self, decl):
        self.flush()
        self.out.append(f"<!{decl}>")

    def unknown_decl(self, data):
        self.flush()
        self.out.append(f"<![{data}]>")

    def handle_pi(self, data):
        self.flush()
        self.out.append(f"<?{data}>")


def main():
    changed = 0
    for path in sorted(DIST.rglob("*.html")):
        source = path.read_text(encoding="utf-8")
        rewriter = Rewriter()
        rewriter.feed(source)
        rewriter.close()
        rewriter.flush()
        result = "".join(rewriter.out)
        # <wbr> 以外は1文字も変えていないことを確かめる
        if result.replace("<wbr>", "") != source.replace("<wbr>", ""):
            sys.exit(f"{path}: <wbr> 以外の差分が出たので中止します")
        if result != source:
            path.write_text(result, encoding="utf-8")
            changed += 1
            print(f"updated {path.relative_to(DIST.parent)}")
    print(f"{changed} file(s) updated")


if __name__ == "__main__":
    main()
