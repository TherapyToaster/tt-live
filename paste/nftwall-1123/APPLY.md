# NFT Wall v7 (Nov 23 holdings) — PREP ONLY, not published

Holdings checked 2026-11-23 1:38 AM EST via public wallet APIs.
803 NFTs (was 786). Added 17, removed 0.

## Push is blocked on this box
`/workspace/ttw/tt-live` is not a usable git checkout after the box restore, and the earlier local commits (`a52f0a8` assets, `b838285` pastes) were never pushed and did not survive. Do not invent credentials. To publish later:

1. Restore a normal tt-live git checkout with push access.
2. Copy staged files into it:
   - `/workspace/art-wall-refresh/tt-live-staged/a/6` → `a/6`
   - `/workspace/art-wall-refresh/tt-live-staged/a/6s` → `a/6s`
   - `/workspace/art-wall-refresh/tt-live-staged/paste/nftwall-1123` → `paste/nftwall-1123`
3. `git pull --rebase`, then commit `a/6` and `a/6s` first (TherapyToaster / tt-live@users.noreply.github.com).
4. Run `python3 /workspace/art-wall-refresh/fill_commit.py <full-asset-commit-hash>` to pin the paste jsDelivr URLs.
5. Commit the pastes, push with `git push -q 2>&1 | sed 's#https://[^ ]*#[remote]#g'`.
6. After Coty approves, paste into Squarespace. Do not change live `a/5`.

Until step 4, paste files contain the placeholders `a52f0a876f9a238dd13671edd4bd76b5277a9933` and `a52f0a8` and are not valid jsDelivr URLs.

## What changed
- 13 Messed and Mixed: 231, 232, 233, 234, 235, 236, 237, 238, 239, 242, 243, 244, 245
- Utopia: Memory of the Steppe
- Dancing in Thoughts: In Argonaut's Thought
- VESPERA (new collection): CROSSING PATHS, THE SIGNAL

The 13 marketplace-listed Solana pieces from Nov 22 are still in the same escrow and stay on the wall.

## Paste targets
- `/nft-wall` Code block: `00-nft-wall-standalone.html`. Page header `01-nft-wall-page-header.html` does not need to change.
- `/mr-toastys-nft-wall` Code block `block-yui_3_17_2_1_1794559913087_456`: `10-nft-wall-456-v7-h1-share.html`
- `/skullz` Code block `block-yui_3_17_2_1_1794560432673_853`: `09b-skullz-853-nft-wall-v7-share.html`
- Home Code block `block-yui_3_17_2_1_1794559913087_3118` (no share buttons): `04-home-3118-nft-wall-v7.html`

Do not paste until Coty approves.
