#!/usr/bin/env python3
"""Generate the finished-tournament permalink pages + the /alltournaments overview
page for the FIFA app, and patch the main index.html seed list.

Re-run after editing the TOURNAMENTS data below. Safe to run repeatedly.
"""
import json, re, sys, shutil
from datetime import datetime, timezone
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]

NAT = {
    "in": "India", "co": "Colombia", "at": "Austria",
    "gr": "Greece", "tr": "Turkey", "de": "Germany",
}

# Each game: (teamA_names, scoreA, scoreB, teamB_names, overtime)
TOURNAMENTS = [
    {
        "slug": "04_05_2026",
        "date": "2026-04-05",
        "label": "April 5, 2026",
        "players": [("Ricky","in"),("Alldad","co"),("Michaeld","at"),("Nontas","gr"),("Erhan","tr")],
        "games": [
            (["Ricky","Alldad"],1,0,["Michaeld","Erhan"],False),
            (["Alldad","Erhan"],1,6,["Ricky","Nontas"],False),
            (["Ricky","Nontas"],2,0,["Michaeld","Alldad"],False),
            (["Michaeld","Alldad"],1,1,["Nontas","Erhan"],True),
            (["Ricky","Michaeld"],2,2,["Nontas","Erhan"],True),
            (["Ricky","Michaeld"],1,0,["Alldad","Erhan"],False),
            (["Nontas","Alldad"],2,3,["Ricky","Erhan"],True),
            (["Nontas","Alldad"],3,0,["Ricky","Michaeld"],False),
            (["Nontas","Alldad"],0,1,["Michaeld","Erhan"],False),
            (["Nontas","Michaeld"],6,3,["Ricky","Erhan"],False),
            (["Michaeld","Alldad"],5,4,["Ricky","Erhan"],True),
            (["Nontas","Erhan"],0,2,["Ricky","Alldad"],False),
            (["Ricky","Alldad"],3,5,["Nontas","Michaeld"],True),
            (["Alldad","Erhan"],1,6,["Nontas","Michaeld"],False),
            (["Michaeld","Erhan"],1,2,["Ricky","Nontas"],True),
        ],
        "expected": {
            "Nontas":(7,2,3,35,18,23),"Ricky":(7,1,4,29,25,22),"Michaeld":(6,2,4,28,22,20),
            "Alldad":(4,1,7,19,29,13),"Erhan":(2,2,8,17,34,8),
        },
    },
    {
        "slug": "06_05_2026",
        "date": "2026-06-05",
        "label": "June 5, 2026",
        "players": [("Michaeld","at"),("Nontas","gr"),("Rakshith","in"),("Erhan","tr"),("Garcia","co")],
        "games": [
            (["Michaeld","Nontas"],0,2,["Rakshith","Erhan"],False),
            (["Nontas","Erhan"],2,3,["Garcia","Rakshith"],False),
            (["Garcia","Erhan"],1,2,["Michaeld","Rakshith"],False),
            (["Michaeld","Nontas"],0,3,["Garcia","Erhan"],False),
            (["Michaeld","Garcia"],1,3,["Rakshith","Nontas"],False),
            (["Nontas","Erhan"],1,2,["Michaeld","Rakshith"],False),
            (["Garcia","Nontas"],3,2,["Rakshith","Erhan"],False),
            (["Garcia","Rakshith"],2,2,["Michaeld","Erhan"],False),
            (["Michaeld","Garcia"],4,2,["Nontas","Erhan"],False),
            (["Michaeld","Rakshith"],3,1,["Garcia","Nontas"],False),
            (["Michaeld","Erhan"],5,3,["Rakshith","Nontas"],False),
            (["Rakshith","Nontas"],1,0,["Garcia","Erhan"],False),
            (["Michaeld","Garcia"],3,0,["Rakshith","Erhan"],False),
            (["Michaeld","Erhan"],2,3,["Garcia","Nontas"],False),
            (["Michaeld","Nontas"],1,3,["Garcia","Rakshith"],False),
        ],
        "expected": {
            "Rakshith":(8,1,3,26,20,25),"Garcia":(7,1,4,27,20,22),"Michaeld":(6,1,5,25,24,19),
            "Nontas":(4,0,8,20,30,12),"Erhan":(3,1,8,22,26,10),
        },
    },
    {
        "slug": "09_05_2026",
        "date": "2026-09-05",
        "label": "September 5, 2026",
        "players": [("Erhan","tr"),("Ricky","de"),("Aldad","co"),("Nontas","gr"),("Doni","at")],
        "games": [
            (["Erhan","Ricky"],0,1,["Aldad","Doni"],False),
            (["Erhan","Ricky"],1,3,["Nontas","Doni"],False),
            (["Nontas","Ricky"],2,1,["Aldad","Doni"],False),
            (["Erhan","Aldad"],0,4,["Nontas","Doni"],False),
            (["Aldad","Nontas"],1,0,["Erhan","Ricky"],False),
            (["Aldad","Ricky"],5,1,["Erhan","Doni"],False),
            (["Ricky","Doni"],5,4,["Erhan","Nontas"],True),
            (["Aldad","Nontas"],3,2,["Ricky","Doni"],False),
            (["Erhan","Nontas"],3,3,["Aldad","Doni"],True),
            (["Erhan","Nontas"],2,4,["Aldad","Ricky"],False),
            (["Ricky","Doni"],3,2,["Erhan","Aldad"],False),
            (["Nontas","Ricky"],3,3,["Erhan","Doni"],True),
            (["Aldad","Ricky"],4,2,["Nontas","Doni"],False),
            (["Aldad","Nontas"],1,2,["Erhan","Doni"],False),
            (["Erhan","Aldad"],1,2,["Nontas","Ricky"],False),
        ],
        "expected": {
            "Ricky":(7,1,4,31,24,22),"Nontas":(6,2,4,30,26,20),"Doni":(6,2,4,30,28,20),
            "Aldad":(6,1,5,26,23,19),"Erhan":(1,2,9,19,35,5),
        },
    },
    {
        "slug": "09_05_2026_02",
        "date": "2026-09-05",
        "label": "September 5, 2026 (II)",
        "players": [("Ricky","de"),("Eehan","tr"),("Alldad","co"),("Nontas","gr"),("Michael","at")],
        "games": [
            (["Ricky","Eehan"],1,6,["Alldad","Nontas"],False),
            (["Alldad","Ricky"],1,3,["Nontas","Michael"],False),
            (["Nontas","Ricky"],3,1,["Michael","Eehan"],False),
            (["Alldad","Nontas"],4,0,["Michael","Eehan"],False),
            (["Alldad","Ricky"],3,2,["Michael","Eehan"],False),
            (["Alldad","Eehan"],1,3,["Nontas","Ricky"],False),
            (["Nontas","Ricky"],6,5,["Alldad","Michael"],False),
            (["Nontas","Eehan"],2,5,["Ricky","Michael"],False),
            (["Nontas","Michael"],5,2,["Alldad","Eehan"],False),
            (["Ricky","Michael"],4,0,["Alldad","Eehan"],False),
            (["Alldad","Ricky"],2,1,["Nontas","Eehan"],False),
            (["Ricky","Michael"],2,3,["Alldad","Nontas"],False),
            (["Nontas","Michael"],1,2,["Ricky","Eehan"],False),
            (["Alldad","Michael"],6,4,["Nontas","Eehan"],False),
            (["Ricky","Eehan"],4,2,["Alldad","Michael"],False),
        ],
        "expected": {
            "Ricky":(9,0,3,36,27,27),"Nontas":(8,0,4,41,28,24),"Alldad":(6,0,6,35,35,18),
            "Michael":(5,0,7,36,34,15),"Eehan":(2,0,10,20,44,6),
        },
    },
]


def compute(t):
    names = [n for n, _ in t["players"]]
    s = {n: dict(gp=0, w=0, d=0, l=0, gf=0, ga=0, pts=0) for n in names}
    for a, sa, sb, b, _ot in t["games"]:
        for n in a:
            r = s[n]; r["gp"]+=1; r["gf"]+=sa; r["ga"]+=sb
            if sa>sb: r["w"]+=1; r["pts"]+=3
            elif sa==sb: r["d"]+=1; r["pts"]+=1
            else: r["l"]+=1
        for n in b:
            r = s[n]; r["gp"]+=1; r["gf"]+=sb; r["ga"]+=sa
            if sb>sa: r["w"]+=1; r["pts"]+=3
            elif sa==sb: r["d"]+=1; r["pts"]+=1
            else: r["l"]+=1
    ordered = sorted(names, key=lambda n: (-s[n]["pts"], -(s[n]["gf"]-s[n]["ga"]), -s[n]["gf"], n))
    return s, ordered


def verify():
    ok = True
    for t in TOURNAMENTS:
        s, ordered = compute(t)
        for n, (w,d,l,gf,ga,pts) in t["expected"].items():
            r = s[n]
            got = (r["w"],r["d"],r["l"],r["gf"],r["ga"],r["pts"])
            if got != (w,d,l,gf,ga,pts):
                ok = False
                print(f"MISMATCH {t['slug']} {n}: expected {(w,d,l,gf,ga,pts)} got {got}")
            if r["gp"] != 12:
                ok = False
                print(f"GP!=12 {t['slug']} {n}: {r['gp']}")
        print(f"{t['slug']}: winner {ordered[0]}  order {ordered}")
    return ok


def slug_pid(slug, name):
    return f"{slug}_{name.lower()}"


def build_seed_js():
    entries = []
    for t in TOURNAMENTS:
        slug = t["slug"]
        ts = int(datetime.fromisoformat(t["date"]).replace(tzinfo=timezone.utc).timestamp()*1000)
        # nudge the second same-day tournament later
        if slug.endswith("_02"):
            ts += 2*3600*1000
        s, ordered = compute(t)
        winner = ordered[0]
        state_players = [
            {"id": slug_pid(slug, n), "name": n, "countryCode": c, "countryName": NAT[c]}
            for n, c in t["players"]
        ]
        games = []
        for i, (a, sa, sb, b, ot) in enumerate(t["games"]):
            games.append({
                "id": f"g1_{i}_{slug}",
                "round": 1,
                "teamA": [slug_pid(slug, n) for n in a],
                "teamB": [slug_pid(slug, n) for n in b],
                "scoreA": sa, "scoreB": sb,
                "confirmed": True, "overtime": bool(ot), "touched": True,
            })
        entry = {
            "id": slug,
            "title": " · ".join(n for n, _ in t["players"]),
            "meta": f"5 Players · Round 1 · {len(t['games'])} games played",
            "winnerName": winner,
            "savedAt": ts,
            "url": f"https://mike-dono-0815.github.io/fifa-app/tour_{slug}/",
            "players": [{"name": n, "code": c} for n, c in t["players"]],
            "state": {"currentRound": 1, "createdAt": ts, "players": state_players, "games": games},
        }
        entries.append(entry)
    # newest first
    entries.sort(key=lambda e: -e["savedAt"])
    body = ",\n".join("  " + json.dumps(e, ensure_ascii=False) for e in entries)
    return "const SEED_FINISHED_TOURNAMENTS = [\n" + body + "\n];", entries


SEED_RE = re.compile(r"const SEED_FINISHED_TOURNAMENTS = \[.*?\n\];", re.S)


def patch_main(src, seed_js):
    src = src.replace(
        "const RETIRED_SEED_IDS = ['demo_garcia_goodbye'];",
        "const RETIRED_SEED_IDS = ['demo_garcia_goodbye','demo_nontas_champion'];",
    )
    src = SEED_RE.sub(lambda m: seed_js, src, count=1)
    # hero link to the overview page (idempotent)
    if "overview-link" not in src:
        src = src.replace(
            '<p class="subtitle">WC Edition &nbsp;·&nbsp; 2v2 Edition</p>',
            '<p class="subtitle">WC Edition &nbsp;·&nbsp; 2v2 Edition</p>\n    '
            '<a class="overview-link" href="alltournaments/">&#128203; All Tournaments &rarr;</a>',
        )
        src = src.replace(
            ".setup-hero .subtitle{",
            ".overview-link{display:inline-block;margin-top:12px;font-family:'Barlow Condensed',sans-serif;"
            "font-weight:700;font-size:.85rem;letter-spacing:.08em;text-transform:uppercase;color:var(--blue-neon);"
            "text-decoration:none;border:1px solid var(--blue-neon);border-radius:var(--r-sm);padding:7px 16px;"
            "transition:background .2s}\n.overview-link:hover{background:var(--blue-glow)}\n.setup-hero .subtitle{",
        )
    return src


def patch_tour(src, seed_js, entry, t):
    src = SEED_RE.sub(lambda m: seed_js, src, count=1)
    src = src.replace(
        "const RETIRED_SEED_IDS = ['demo_garcia_goodbye'];",
        "const RETIRED_SEED_IDS = ['demo_garcia_goodbye','demo_nontas_champion'];",
    )
    year = t["date"][:4]
    src = src.replace(
        "<title>FC 2026 Tournament – Garcia Goodbye</title>",
        f"<title>FC {year} Tournament – {t['label']}</title>",
    )
    src = src.replace(
        '<h1 class="tourney-title">FC 2026 &mdash; Garcia Goodbye</h1>',
        f'<h1 class="tourney-title">FC {year} &mdash; {t["label"]}</h1>',
    )
    # header: drop Saves + New Tournament, add back-link
    src = src.replace(
        '''      <div class="header-actions">
        <button class="btn-history" id="btn-history">
          &#9202; Saves <span class="save-badge" id="save-badge">0</span>
        </button>
        <button class="btn-pdf" id="btn-pdf">&#128196; PDF</button>
        <button class="btn-new-tournament" id="btn-new-tournament">New Tournament</button>
      </div>''',
        '''      <div class="header-actions">
        <a class="btn-pdf" href="/fifa-app/alltournaments/">&#8592; All Tournaments</a>
        <button class="btn-pdf" id="btn-pdf">&#128196; PDF</button>
      </div>''',
    )
    # asset paths -> absolute
    src = src.replace('src="trophy_fa.png"', 'src="/fifa-app/trophy_fa.png"')
    src = src.replace(
        'function flagSrc(code){return code?`w320/${code.toLowerCase()}.png`:BLANK_IMG;}',
        'function flagSrc(code){return code?`/fifa-app/w320/${code.toLowerCase()}.png`:BLANK_IMG;}',
    )
    # remove listeners bound to now-absent buttons
    src = src.replace(
        '''// New tournament
document.getElementById('btn-new-tournament').addEventListener('click',()=>{
  if(!confirm('Start a new tournament? All current progress will be lost.'))return;
  archiveFinishedTournament();
  STATE.players=[];STATE.games=[];STATE.currentRound=1;STATE.createdAt=null;
  currentSaveKey=null;
  loadedFinishedId=null;
  showScreen('setup');
  STATE.players=[
    {id:uid(),name:'',countryCode:'',countryName:''},
    {id:uid(),name:'',countryCode:'',countryName:''},
    {id:uid(),name:'',countryCode:'',countryName:''},
    {id:uid(),name:'',countryCode:'',countryName:''},
    {id:uid(),name:'',countryCode:'',countryName:''},
  ];
  renderSetup();
});

// History panel
document.getElementById('btn-history').addEventListener('click',openHistory);''',
        '''// New Tournament / Saves buttons are not shown on this permalink page.''',
    )
    # init -> load this tournament directly
    src = re.sub(
        r"\(function init\(\)\{.*?\}\)\(\);",
        "(function init(){\n"
        "  updateSaveBadge();\n"
        f"  loadDemoTournament({entry['id']!r});\n"
        "})();",
        src, count=1, flags=re.S,
    )
    return src


OVERVIEW_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>FC Tournaments – All Results</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,600;0,700;0,800;0,900;1,900&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
img{display:block}
:root{
  --bg-void:#080a0f;--bg-surface:#0f1318;--bg-raised:#161b23;
  --green-bright:#00e676;--blue-neon:#00b4ff;--blue-glow:rgba(0,180,255,.15);
  --purple:#a855f7;--gold:#ffd700;--silver:#c0c0c0;--bronze:#cd7f32;
  --text-primary:#f0f4f8;--text-secondary:#7a9ab5;--text-muted:#3a5068;
  --border-subtle:rgba(255,255,255,.06);--border-mid:rgba(255,255,255,.12);
  --r:10px;--r-sm:6px;
}
body{font-family:'Inter',system-ui,sans-serif;background:var(--bg-void);color:var(--text-primary);min-height:100vh;padding:40px 20px 80px}
.wrap{max-width:760px;margin:0 auto}
.hero{text-align:center;margin-bottom:36px}
.hero h1{
  font-family:'Barlow Condensed',sans-serif;font-weight:900;font-style:italic;
  font-size:clamp(2.2rem,7vw,3.6rem);text-transform:uppercase;letter-spacing:.04em;line-height:1;
  background:linear-gradient(135deg,#fff 0%,var(--blue-neon) 50%,var(--green-bright) 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:8px;
}
.hero .subtitle{color:var(--text-secondary);font-size:.85rem;letter-spacing:.12em;text-transform:uppercase}
.hero a{display:inline-block;margin-top:16px;font-family:'Barlow Condensed',sans-serif;font-weight:700;
  font-size:.85rem;letter-spacing:.08em;text-transform:uppercase;color:var(--blue-neon);text-decoration:none;
  border:1px solid var(--blue-neon);border-radius:var(--r-sm);padding:7px 16px;transition:background .2s}
.hero a:hover{background:var(--blue-glow)}
.tlist{display:flex;flex-direction:column;gap:14px}
.tcard{
  display:block;text-decoration:none;color:inherit;
  background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--r);
  padding:18px 20px;transition:border-color .2s,transform .1s,box-shadow .2s;
}
.tcard:hover{border-color:var(--blue-neon);box-shadow:0 0 22px var(--blue-glow)}
.tcard:active{transform:scale(.995)}
.tcard-top{display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px}
.tcard-date{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-style:italic;font-size:1.5rem;
  text-transform:uppercase;letter-spacing:.03em}
.tcard-meta{color:var(--text-muted);font-size:.8rem;letter-spacing:.04em}
.tcard-flags{display:flex;gap:5px;margin-bottom:14px}
.tcard-flags img{width:26px;height:18px;border-radius:2px;object-fit:cover;opacity:.9}
.podium{display:flex;gap:10px;flex-wrap:wrap}
.pod{display:flex;align-items:center;gap:7px;background:var(--bg-raised);border:1px solid var(--border-subtle);
  border-radius:var(--r-sm);padding:6px 11px 6px 8px}
.pod img{width:22px;height:15px;border-radius:2px;object-fit:cover}
.pod-medal{font-size:.95rem}
.pod-name{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:1rem;text-transform:uppercase;letter-spacing:.02em}
.pod-pts{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.8rem;color:var(--text-secondary)}
.pod-1{border-color:rgba(255,215,0,.35);box-shadow:inset 3px 0 12px rgba(255,215,0,.12)}
.pod-1 .pod-name{color:var(--gold)}
.pod-2 .pod-name{color:var(--silver)}
.pod-3 .pod-name{color:var(--bronze)}
.foot{margin-top:40px;text-align:center;color:var(--text-muted);font-size:.78rem}
.foot a{color:var(--text-secondary)}
</style>
</head>
<body>
<div class="wrap">
  <div class="hero">
    <h1>All Tournaments</h1>
    <p class="subtitle">FC 2v2 &nbsp;·&nbsp; WC Edition</p>
    <a href="/fifa-app/">&#8592; Back to the app</a>
  </div>
  <div class="tlist">
__CARDS__
  </div>
  <p class="foot">Every result is a frozen snapshot &mdash; open a tournament for the full schedule, table and stats.</p>
</div>
</body>
</html>
"""


def build_overview(entries):
    order = {t["slug"]: t for t in TOURNAMENTS}
    cards = []
    for e in entries:  # already newest-first
        t = order[e["id"]]
        s, ordered = compute(t)
        flags = "".join(
            f'<img src="/fifa-app/w320/{c}.png" alt="{NAT[c]}" title="{n}"/>'
            for n, c in t["players"]
        )
        medals = ["&#129351;", "&#129352;", "&#129353;"]
        pods = []
        for i, n in enumerate(ordered[:3]):
            code = dict(t["players"])[n]
            pods.append(
                f'<div class="pod pod-{i+1}"><span class="pod-medal">{medals[i]}</span>'
                f'<img src="/fifa-app/w320/{code}.png" alt=""/>'
                f'<span class="pod-name">{n}</span><span class="pod-pts">{s[n]["pts"]} pts</span></div>'
            )
        cards.append(
            f'''    <a class="tcard" href="/fifa-app/tour_{t['slug']}/">
      <div class="tcard-top">
        <span class="tcard-date">{t['label']}</span>
        <span class="tcard-meta">5 players &middot; 15 games &middot; 1 round</span>
      </div>
      <div class="tcard-flags">{flags}</div>
      <div class="podium">{''.join(pods)}</div>
    </a>'''
        )
    return OVERVIEW_TMPL.replace("__CARDS__", "\n".join(cards))


def main():
    if not verify():
        print("verification failed; aborting")
        sys.exit(1)
    seed_js, entries = build_seed_js()

    main_src = (REPO / "index.html").read_text(encoding="utf-8")
    new_main = patch_main(main_src, seed_js)
    assert "const SEED_FINISHED_TOURNAMENTS = [\n  {" in new_main
    assert new_main.count("overview-link") == 3
    assert "'demo_nontas_champion'" in new_main
    (REPO / "index.html").write_text(new_main, encoding="utf-8", newline="\n")
    print("patched index.html")

    for t in TOURNAMENTS:
        entry = next(e for e in entries if e["id"] == t["slug"])
        page = patch_tour(main_src, seed_js, entry, t)
        assert f"loadDemoTournament({t['slug']!r})" in page
        assert '<button class="btn-new-tournament"' not in page
        assert '<button class="btn-history"' not in page
        assert "getElementById('btn-new-tournament')" not in page
        assert page.count("(function init(){") == 1
        d = REPO / f"tour_{t['slug']}"
        d.mkdir(exist_ok=True)
        (d / "index.html").write_text(page, encoding="utf-8", newline="\n")
        print(f"wrote tour_{t['slug']}/index.html")

    ov = build_overview(entries)
    od = REPO / "alltournaments"
    od.mkdir(exist_ok=True)
    (od / "index.html").write_text(ov, encoding="utf-8", newline="\n")
    print("wrote alltournaments/index.html")

    old = REPO / "tour_29_04_2025"
    if old.exists():
        shutil.rmtree(old)
        print("removed tour_29_04_2025/")


if __name__ == "__main__":
    main()
