#!/usr/bin/env python3
"""
v3: Annual Return panel now matches the visual density of the CIW widgets.

Adds three info rows (icon + label + gold value pill) inside the panel,
mirroring the way the CIW widgets show three rating badges. Same outer
card shell, same buttons.

Run from /Users/Joe/Downloads/seren-website-37/seren-website-37 :
    mv contact.html.bak contact.html
    python3 patch-ciw-grid-v3.py
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

          <!-- Annual Return - info-row layout mirrors the CIW rating badges -->
          <div class="ciw-card">
            <div class="ciw-region">Annual Return<br/><span>2025 / 2026</span></div>
            <div class="ciw-widget-wrap">
              <div class="ciw-annual-panel">
                <div class="ciw-annual-panel-header">
                  <img src="assets/seren-icon-yellow.png" alt="" class="ciw-annual-logo" loading="lazy"/>
                  <span>Seren Support Services Ltd</span>
                </div>
                <div class="ciw-annual-panel-body">
                  <p><strong>Seren Support Services Ltd</strong> is regulated by Care Inspectorate Wales. This Annual Return covers all regional services across Wales.</p>
                  <div class="ciw-annual-stats">
                    <div class="ciw-annual-stat">
                      <span class="ciw-annual-stat-label">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        Reporting Period
                      </span>
                      <span class="ciw-annual-stat-value">2025 / 2026</span>
                    </div>
                    <div class="ciw-annual-stat">
                      <span class="ciw-annual-stat-label">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        Services Covered
                      </span>
                      <span class="ciw-annual-stat-value">6 regions</span>
                    </div>
                    <div class="ciw-annual-stat">
                      <span class="ciw-annual-stat-label">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        Status
                      </span>
                      <span class="ciw-annual-stat-value">Submitted</span>
                    </div>
                  </div>
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

          /* ===== Annual Return panel ===== */
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
            justify-content: flex-start;
            flex: 1;
          }
          .ciw-annual-panel-body > p {
            font-size: 12.5px;
            line-height: 1.55;
            color: var(--navy);
            margin: 0;
          }
          .ciw-annual-panel-body > p strong {
            font-weight: 700;
          }
          .ciw-annual-stats {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 14px;
          }
          .ciw-annual-stat {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding: 7px 12px;
            background: rgba(14,44,83,0.04);
            border: 1px solid rgba(14,44,83,0.08);
            border-radius: 100px;
          }
          .ciw-annual-stat-label {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            font-size: 11.5px;
            font-weight: 600;
            color: var(--navy);
          }
          .ciw-annual-stat-label svg {
            color: var(--navy);
            opacity: 0.65;
            flex-shrink: 0;
          }
          .ciw-annual-stat-value {
            font-size: 11px;
            font-weight: 700;
            color: #0E1B37;
            background: rgba(251,189,30,0.22);
            border: 1px solid rgba(251,189,30,0.45);
            padding: 3px 10px;
            border-radius: 100px;
            letter-spacing: 0.01em;
            white-space: nowrap;
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
