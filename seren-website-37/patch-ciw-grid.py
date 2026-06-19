#!/usr/bin/env python3
"""
Patch contact.html:
  - Merge the two CIW .ciw-row divs (3+2) into a single 3-column .ciw-grid
  - Add a 6th 'Annual Returns' card (navy gradient + gold accent, frosted-glass icon)
  - Replace the existing CIW <style> block with an updated one
  - Update the section subtitle to reference the Annual Return

Writes contact.html.bak before patching. Idempotent: if the start marker is
gone (already patched), it exits cleanly without doing anything.

Run from /Users/Joe/Downloads/seren-website-37/seren-website-37 :
    python3 patch-ciw-grid.py
"""

import sys
from pathlib import Path

HTML_PATH = Path("contact.html")
START_MARKER = "<!-- ROW 1: 3 cards (Cwm Taf, Cardiff, Gwent) -->"

# The replacement block. First line carries its own 8-space indentation so
# the splice point can include the leading whitespace of the line being
# replaced. No trailing newline (the original file's newline after </style>
# is preserved by the splice).
NEW_BLOCK = """        <!-- 3x2 grid: 5 CIW inspection reports + Annual Returns -->
        <div class="ciw-grid">
          <div class="ciw-card">
            <div class="ciw-region">Cwm Taf<br/><span>Bridgend</span></div>
            <div class="ciw-widget-wrap">
              <script type="text/javascript" src="https://digital.careinspectorate.wales/widget/SIN-00011211-LTKT"></script>
            </div>
            <a href="https://digital.careinspectorate.wales/widget/SIN-00011211-LTKT" target="_blank" rel="noopener noreferrer" class="ciw-link">View Report <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>
          </div>
          <div class="ciw-card">
            <div class="ciw-region">Cardiff<br/><span>&amp; The Vale</span></div>
            <div class="ciw-widget-wrap">
              <script type="text/javascript" src="https://digital.careinspectorate.wales/widget/SIN-00012209-FCKM"></script>
            </div>
            <a href="https://digital.careinspectorate.wales/widget/SIN-00012209-FCKM" target="_blank" rel="noopener noreferrer" class="ciw-link">View Report <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>
          </div>
          <div class="ciw-card">
            <div class="ciw-region">Gwent<br/><span>&nbsp;</span></div>
            <div class="ciw-widget-wrap">
              <script type="text/javascript" src="https://digital.careinspectorate.wales/widget/SIN-00010353-QMRK"></script>
            </div>
            <a href="https://digital.careinspectorate.wales/widget/SIN-00010353-QMRK" target="_blank" rel="noopener noreferrer" class="ciw-link">View Report <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>
          </div>
          <div class="ciw-card">
            <div class="ciw-region">Powys<br/><span>&nbsp;</span></div>
            <div class="ciw-widget-wrap">
              <script type="text/javascript" src="https://digital.careinspectorate.wales/widget/SIN-00010352-KKBP"></script>
            </div>
            <a href="https://digital.careinspectorate.wales/widget/SIN-00010352-KKBP" target="_blank" rel="noopener noreferrer" class="ciw-link">View Report <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>
          </div>
          <div class="ciw-card">
            <div class="ciw-region">Western Bay<br/><span>&nbsp;</span></div>
            <div class="ciw-widget-wrap">
              <script type="text/javascript" src="https://digital.careinspectorate.wales/widget/SIN-00010351-VRPV"></script>
            </div>
            <a href="https://digital.careinspectorate.wales/widget/SIN-00010351-VRPV" target="_blank" rel="noopener noreferrer" class="ciw-link">View Report <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>
          </div>

          <!-- Annual Returns - intentionally distinct: navy gradient + gold accent -->
          <div class="ciw-card ciw-card--annual">
            <div class="ciw-region ciw-region--annual">Annual Returns<br/><span>2025 / 2026</span></div>
            <div class="ciw-annual-body">
              <div class="ciw-annual-icon" aria-hidden="true">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="9" y1="13" x2="15" y2="13"/>
                  <line x1="9" y1="17" x2="15" y2="17"/>
                  <line x1="9" y1="9" x2="11" y2="9"/>
                </svg>
              </div>
              <p class="ciw-annual-desc">Our latest Annual Return to Care Inspectorate Wales, covering all six regional services across Wales.</p>
            </div>
            <div class="ciw-annual-actions">
              <a href="assets/annual-return-2025-2026.html" target="_blank" rel="noopener noreferrer" class="ciw-link ciw-link--gold">View Online <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>
              <a href="assets/annual-return-2025-2026.pdf" target="_blank" rel="noopener noreferrer" class="ciw-annual-pdf">Download PDF <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></a>
            </div>
          </div>
        </div>

        <style>
          .ciw-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 340px));
            gap: 24px;
            justify-content: center;
            width: 100%;
            margin: 0 auto;
          }

          .ciw-card {
            background: #fff;
            border: 1.5px solid rgba(14,44,83,0.10);
            border-radius: 18px;
            padding: 24px 22px 22px;
            overflow: hidden;
            box-sizing: border-box;
            width: 100%;
            text-align: center;
            box-shadow: 0 2px 12px rgba(14,44,83,0.06);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            transition: box-shadow 0.3s ease, transform 0.3s ease;
          }
          .ciw-card:hover {
            box-shadow: 0 12px 36px rgba(14,44,83,0.13);
            transform: translateY(-3px);
          }
          .ciw-region {
            font-family: 'Poppins', sans-serif;
            font-size: 15px;
            font-weight: 700;
            color: var(--navy);
            line-height: 1.3;
            padding-bottom: 14px;
            border-bottom: 2px solid #fbbd1e;
            width: 100%;
          }
          .ciw-region span {
            font-size: 12.5px;
            font-weight: 500;
            color: var(--muted);
          }
          .ciw-widget-wrap {
            width: 100%;
            min-height: 80px;
            display: flex;
            align-items: stretch;
            justify-content: center;
          }
          .ciw-widget-wrap > * {
            width: 100% !important;
            max-width: 100% !important;
          }
          .ciw-widget-wrap iframe {
            width: 100% !important;
            border: none;
          }
          .ciw-link {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            font-weight: 600;
            color: var(--navy);
            text-decoration: none;
            padding: 8px 18px;
            border-radius: 100px;
            background: rgba(14,44,83,0.05);
            border: 1px solid rgba(14,44,83,0.12);
            transition: all 0.2s;
            margin-top: auto;
          }
          .ciw-link:hover {
            background: var(--navy);
            color: #fff;
            border-color: var(--navy);
          }

          /* ===== Annual Returns card variant ===== */
          .ciw-card--annual {
            background: linear-gradient(160deg, #0E1B37 0%, #1a2f5c 100%);
            border: 1.5px solid rgba(251,189,30,0.25);
            color: #fff;
            position: relative;
            overflow: hidden;
          }
          .ciw-card--annual::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle at center, rgba(251,189,30,0.12) 0%, transparent 55%);
            pointer-events: none;
            transition: opacity 0.4s ease;
            opacity: 0.55;
          }
          .ciw-card--annual:hover {
            box-shadow: 0 18px 44px rgba(14,27,55,0.38), 0 0 0 1px rgba(251,189,30,0.4);
            transform: translateY(-3px);
          }
          .ciw-card--annual:hover::before { opacity: 1; }
          .ciw-card--annual > * { position: relative; z-index: 1; }

          .ciw-region--annual { color: #fff; border-bottom: 2px solid #fbbd1e; }
          .ciw-region--annual span { color: rgba(251,189,30,0.88); font-weight: 600; }

          .ciw-annual-body {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 14px;
            padding: 4px 0;
          }
          .ciw-annual-icon {
            color: #fbbd1e;
            background: rgba(251,189,30,0.10);
            border: 1px solid rgba(251,189,30,0.25);
            border-radius: 14px;
            width: 72px;
            height: 72px;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
          }
          .ciw-annual-desc {
            font-size: 13.5px;
            line-height: 1.55;
            color: rgba(255,255,255,0.78);
            margin: 0;
            max-width: 260px;
          }
          .ciw-annual-actions {
            display: flex;
            flex-direction: column;
            gap: 10px;
            align-items: center;
            margin-top: auto;
            width: 100%;
          }
          .ciw-link--gold {
            background: #fbbd1e;
            color: #0E1B37;
            border-color: #fbbd1e;
            font-weight: 700;
          }
          .ciw-link--gold:hover {
            background: #fff;
            color: #0E1B37;
            border-color: #fff;
          }
          .ciw-annual-pdf {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 11.5px;
            font-weight: 600;
            color: rgba(255,255,255,0.65);
            text-decoration: none;
            letter-spacing: 0.02em;
            transition: color 0.2s;
          }
          .ciw-annual-pdf:hover { color: #fbbd1e; }

          @media (max-width: 1100px) {
            .ciw-grid { grid-template-columns: repeat(3, minmax(0, 320px)); gap: 18px; }
          }
          @media (max-width: 920px) {
            .ciw-grid { grid-template-columns: repeat(2, minmax(240px, 320px)); gap: 16px; }
          }
          @media (max-width: 540px) {
            .ciw-grid { grid-template-columns: minmax(240px, 360px); }
          }
        </style>"""

OLD_SUBTITLE = (
    "Seren Support Services is regulated and inspected by Care Inspectorate "
    "Wales across every region we serve. Click any badge to view our latest "
    "inspection report."
)
NEW_SUBTITLE = (
    "Seren Support Services is regulated and inspected by Care Inspectorate "
    "Wales across every region we serve. View our latest inspection reports "
    "and Annual Return below."
)


def main():
    if not HTML_PATH.exists():
        print(f"ERROR: {HTML_PATH} not found. cd into the website working dir first.")
        sys.exit(1)

    html = HTML_PATH.read_text()

    marker_idx = html.find(START_MARKER)
    if marker_idx == -1:
        print("Nothing to do: start marker not found. File may already be patched.")
        sys.exit(0)

    # Back up to the start of the line containing the marker so we replace
    # whole lines (preserving clean indentation).
    line_start = html.rfind("\n", 0, marker_idx) + 1

    # Find the </style> tag that closes the old CIW styles block.
    style_end = html.find("</style>", marker_idx)
    if style_end == -1:
        print("ERROR: closing </style> not found after start marker. Aborting.")
        sys.exit(1)
    style_end += len("</style>")

    # Backup
    backup = Path("contact.html.bak")
    backup.write_text(html)
    print(f"[OK] Backup written to {backup}")

    # Splice in the new block
    new_html = html[:line_start] + NEW_BLOCK + html[style_end:]

    # Update subtitle copy
    if OLD_SUBTITLE in new_html:
        new_html = new_html.replace(OLD_SUBTITLE, NEW_SUBTITLE)
        print("[OK] Subtitle updated")
    else:
        print("[WARN] Subtitle not found verbatim - left untouched")

    HTML_PATH.write_text(new_html)
    size_delta = len(new_html) - len(html)
    print(f"[OK] {HTML_PATH} patched ({size_delta:+d} bytes)")
    print("\nNext: open contact.html in a browser and screenshot the CIW section.")


if __name__ == "__main__":
    main()
