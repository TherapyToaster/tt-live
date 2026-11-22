#!/usr/bin/env python3
"""Idempotent Home patch: InsiderThreadsX card tagline + current X PFPs.

Changes:
  1) Crew card tagline: <p>No insider threat.</p> -> <p>Active Wear</p>
     (only the @InsiderThreadsX card; other cards unchanged)
  2) All six Meet-the-Crew card images point at tt-live hosted copies of
     each account's current X profile photo (400x400), pinned by commit
     and cache-busted with a content hash so X URL rotations cannot break them.

Standing chain: run AFTER handle-rename/apply_handle.py and BEFORE
speed/apply_speed_v1.py (apply_speed_v1.py stays last).

Usage:
  python3 /workspace/activewear/apply_activewear.py IN OUT
IN may equal OUT. Safe to re-run on any Home version.
Never touches the TT48 markers or the TherapyToaster/status/ link.
"""
from __future__ import annotations

import sys

# Filled after the assets/pfp commit is pushed.
PFP_COMMIT = "e8b82bf912c1730e03973e13865c038f8e33cdf5"
PFP_URLS = {
    "TherapyToaster": "https://cdn.jsdelivr.net/gh/TherapyToaster/tt-live@" + PFP_COMMIT + "/assets/pfp/therapytoaster.jpg?c=4cf53fb4912a",
    "ToastyCoty": "https://cdn.jsdelivr.net/gh/TherapyToaster/tt-live@" + PFP_COMMIT + "/assets/pfp/toastycoty.jpg?c=8067cd5f2e0f",
    "FatCoty": "https://cdn.jsdelivr.net/gh/TherapyToaster/tt-live@" + PFP_COMMIT + "/assets/pfp/fatcoty.jpg?c=838d778873be",
    "TriggeredCoty": "https://cdn.jsdelivr.net/gh/TherapyToaster/tt-live@" + PFP_COMMIT + "/assets/pfp/triggeredcoty.jpg?c=1956562dade6",
    "YellowBlankey": "https://cdn.jsdelivr.net/gh/TherapyToaster/tt-live@" + PFP_COMMIT + "/assets/pfp/yellowblankey.jpg?c=a97dd5aaae50",
    "InsiderThreadsX": "https://cdn.jsdelivr.net/gh/TherapyToaster/tt-live@" + PFP_COMMIT + "/assets/pfp/insiderthreadsx.jpg?c=3164d9b3021f",
}

# Historic jsDelivr pins used on live v470 (and earlier).
OLD_SRCS = (
    "https://cdn.jsdelivr.net/gh/TherapyToaster/tt-live@5e6211ee6b30c22ae11a66e761ec18dbc4799e4e/crew/pfp-20261111/therapytoaster.jpg",
    "https://cdn.jsdelivr.net/gh/TherapyToaster/tt-live@5e6211ee6b30c22ae11a66e761ec18dbc4799e4e/crew/pfp-20261111/toastycoty.jpg",
    "https://cdn.jsdelivr.net/gh/TherapyToaster/tt-live@5e6211ee6b30c22ae11a66e761ec18dbc4799e4e/crew/pfp-20261111/fatcoty.jpg",
    "https://cdn.jsdelivr.net/gh/TherapyToaster/tt-live@5e6211ee6b30c22ae11a66e761ec18dbc4799e4e/crew/pfp-20261111/triggeredcoty.jpg",
    "https://cdn.jsdelivr.net/gh/TherapyToaster/tt-live@5e6211ee6b30c22ae11a66e761ec18dbc4799e4e/crew/pfp-20261111/yellowblankey.jpg",
    "https://cdn.jsdelivr.net/gh/TherapyToaster/tt-live@939f0e1519f3ed1ab9a76e0ed2dd0f133095ea16/crew/pfp-20261111/insidernothreat.jpg",
    "https://cdn.jsdelivr.net/gh/TherapyToaster/tt-live@939f0e1519f3ed1ab9a76e0ed2dd0f133095ea16/crew/pfp-20261111/noinsiderthreat.jpg",
)

# Map a recognized pfp basename (in any historic URL) to the new URL.
BASENAME_TO_ALT = {
    "therapytoaster": "TherapyToaster",
    "toastycoty": "ToastyCoty",
    "fatcoty": "FatCoty",
    "triggeredcoty": "TriggeredCoty",
    "yellowblankey": "YellowBlankey",
    "insidernothreat": "InsiderThreadsX",
    "noinsiderthreat": "InsiderThreadsX",
    "insiderthreadsx": "InsiderThreadsX",
}

OLD_TAG = "<h3>@InsiderThreadsX</h3><p>No insider threat.</p>"
NEW_TAG = "<h3>@InsiderThreadsX</h3><p>Active Wear</p>"
# In case an older file still has the pre-rename handle on the card.
OLD_TAG_LEGACY = "<h3>@InsiderNoThreat</h3><p>No insider threat.</p>"
OLD_TAG_LEGACY2 = "<h3>@noInsiderThreat</h3><p>No insider threat.</p>"


def apply(text: str) -> str:
    n0 = text.count("TherapyToaster/status/")
    t48a, t48b = text.count("<!-- TT48 START -->"), text.count("<!-- TT48 END -->")

    # 1) tagline
    if OLD_TAG in text:
        text = text.replace(OLD_TAG, NEW_TAG)
    elif OLD_TAG_LEGACY in text:
        # handle-rename should already have run; still be safe
        text = text.replace(OLD_TAG_LEGACY, NEW_TAG)
    elif OLD_TAG_LEGACY2 in text:
        text = text.replace(OLD_TAG_LEGACY2, NEW_TAG)

    # 2) PFP urls: exact historic srcs first, then any remaining basename in img src
    for old in OLD_SRCS:
        if old in text:
            # pick target by filename
            base = old.rsplit("/", 1)[-1].split("?", 1)[0].rsplit(".", 1)[0].lower()
            alt = BASENAME_TO_ALT[base]
            text = text.replace(old, PFP_URLS[alt])

    # Rewrite any leftover crew-card img whose path basename we know, if it is
    # not already the pinned new URL. Keeps rebuilds idempotent when a mid-chain
    # file used a different pin of the same filename.
    import re
    def img_sub(m: re.Match) -> str:
        pre, url, post = m.group(1), m.group(2), m.group(3)
        path = url.split("?", 1)[0]
        base = path.rsplit("/", 1)[-1].rsplit(".", 1)[0].lower()
        alt = BASENAME_TO_ALT.get(base)
        if not alt:
            return m.group(0)
        new = PFP_URLS[alt]
        return pre + new + post if url != new else m.group(0)

    text = re.sub(
        r'(<a class="card"[^>]*>\s*<img src=")([^"]+)(")',
        img_sub,
        text,
    )

    assert text.count("TherapyToaster/status/") == n0, "status link count changed"
    assert text.count("<!-- TT48 START -->") == t48a
    assert text.count("<!-- TT48 END -->") == t48b
    return text


def main(argv: list[str] | None = None) -> int:
    argv = list(sys.argv[1:] if argv is None else argv)
    if len(argv) != 2:
        print("usage: apply_activewear.py IN OUT", file=sys.stderr)
        return 2
    src, dst = argv
    raw = open(src, encoding="utf-8").read()
    out = apply(raw)
    open(dst, "w", encoding="utf-8").write(out)
    print(
        f"patched {dst} chars={len(out)} "
        f"tagline_activewear={out.count(NEW_TAG)} "
        f"old_tagline={out.count('No insider threat.')} "
        f"new_pfp_hits={out.count('/assets/pfp/')}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
