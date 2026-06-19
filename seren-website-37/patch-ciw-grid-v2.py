#!/usr/bin/env python3
"""
v2: Patch contact.html with redesigned Annual Return card.

Changes vs v1:
  - Annual Return card is now visually consistent with the CIW widgets:
    white card shell, gold-underlined region header, inner panel mirroring
    the CIW widget's header-banner + body + date-line rhythm, single
    "View Annual Return" pill button at the bottom matching the others.
  - Dropped the navy-gradient .ciw-card--annual variant and related styles.

Roll back to .bak first, then re-run this script.

Run from /Users/Joe/Downloads/seren-website-37/seren-website-37 :
    mv contact.html.bak contact.html
    python3 patch-ciw-grid.py
"""

import sys
from pathlib import Path

HTML_PATH = Path("contact.html")
START_MARKER = "<!-- ROW 1: 3 cards (Cwm Taf, Cardiff, Gwent) -->"

NEW_BLOCK = """        <!-- 3x2 grid: 5 CIW inspection reports + Annual Return -->
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

          <!-- Annual Return - mirrors the visual rhythm of the CIW widgets -->
          <div class="ciw-card">
            <div class="ciw-region">Annual Return<br/><span>2025 / 2026</span></div>
            <div class="ciw-widget-wrap">
              <div class="ciw-annual-panel">
                <div class="ciw-annual-panel-header">
                  <img src="assets/seren-icon-yellow.png" alt="" class="ciw-annual-logo" loading="lazy"/>
                  <span>Seren Support Services Ltd</span>
                </div>
                <div class="ciw-annual-panel-body">
                  <p><strong>Seren Support Services Ltd</strong> is regulated by Care Inspectorate Wales. This is our Annual Return covering all six regional services across Wales.</p>
                  <p class="ciw-annual-panel-date">Published: May 2026</p>
                </div>
              </div>
            </div>
            <a href="assets/annual-return-2025-2026.html" target="_blank" rel="noopener noreferrer" class="ciw-link">View Annual Return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>
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

          /* ===== Annual Return panel - structured like the CIW widgets ===== */
          .ciw-annual-panel {
            width: 100%;
            border: 1px solid rgba(14,44,83,0.10);
            border-radius: 8px;
            overflow: hidden;
            background: #fff;
            display: flex;
            flex-direction: column;
            box-shadow: 0 1px 3px rgba(14,44,83,0.05);
          }
          .ciw-annual-panel-header {
            background: linear-gradient(135deg, #0E1B37, #1a2f5c);
            color: #fff;
            padding: 12px 14px;
            display: flex;
            align-items: center;
            gap: 10px;
            font-family: 'Poppins', sans-serif;
            font-size: 12.5px;
            font-weight: 600;
            letter-spacing: 0.01em;
            text-align: left;
          }
          .ciw-annual-logo {
            width: 24px;
            height: 24px;
            flex-shrink: 0;
          }
          .ciw-annual-panel-body {
            padding: 14px;
            text-align: left;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            flex: 1;
          }
          .ciw-annual-panel-body p {
            font-size: 12.5px;
            line-height: 1.55;
            color: var(--navy);
            margin: 0;
          }
          .ciw-annual-panel-body p strong {
            font-weight: 700;
          }
          .ciw-annual-panel-date {
            margin-top: 12px !important;
            font-size: 11.5px !important;
            color: var(--muted) !important;
          }

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
        print("Nothing to do: start marker not found.")
        print("Roll back first:  mv contact.html.bak contact.html")
        sys.exit(0)

    line_start = html.rfind("\n", 0, marker_idx) + 1

    style_end = html.find("</style>", marker_idx)
    if style_end == -1:
        print("ERROR: closing </style> not found after start marker. Aborting.")
        sys.exit(1)
    style_end += len("</style>")

    backup = Path("contact.html.bak")
    backup.write_text(html)
    print(f"[OK] Backup written to {backup}")

    new_html = html[:line_start] + NEW_BLOCK + html[style_end:]

    if OLD_SUBTITLE in new_html:
        new_html = new_html.replace(OLD_SUBTITLE, NEW_SUBTITLE)
        print("[OK] Subtitle updated")
    elif NEW_SUBTITLE in new_html:
        print("[OK] Subtitle already updated")
    else:
        print("[WARN] Subtitle not found verbatim - left untouched")

    HTML_PATH.write_text(new_html)
    size_delta = len(new_html) - len(html)
    print(f"[OK] {HTML_PATH} patched ({size_delta:+d} bytes)")


if __name__ == "__main__":
    main()
