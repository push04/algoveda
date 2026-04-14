Design a premium web application called AlgoVeda — a market research and trading intelligence platform for Indian retail investors. This is a multi-screen SaaS product. Build all screens in LIGHT MODE only. The aesthetic direction is "refined financial intelligence" — think Bloomberg Terminal redesigned by a luxury Swiss watchmaker. Clean, precise, data-dense but never cluttered. Not corporate. Not startup-generic. Feels like something you pay ₹4,999/month for and feel good about it.

=============================================================
GLOBAL DESIGN SYSTEM — APPLY TO ALL SCREENS
=============================================================

TYPOGRAPHY:
- Display / Hero headings: "Canela" or "Playfair Display" — serif, high contrast, editorial weight
- UI headings and labels: "Syne" — geometric, slightly wide, very modern
- Body text and paragraphs: "DM Sans" — clean, humanist, excellent at small sizes
- Numbers and data (prices, percentages, metrics): "DM Mono" or "JetBrains Mono" — tabular, crisp
- Never use Inter, Roboto, or any system font anywhere

COLOR PALETTE (Light Mode):
- Background base: #F7F6F2 (warm off-white, not cold white)
- Surface cards: #FFFFFF with subtle warm shadow
- Primary accent: #1A4D2E (deep forest green — NSE/money association, serious, premium)
- Secondary accent: #D4A843 (warm gold — wealth, precision instruments)
- Positive / Up: #16A34A (green, not neon)
- Negative / Down: #DC2626 (red, not bright)
- Neutral text primary: #0F1A14 (near-black with green undertone)
- Neutral text secondary: #4A5568
- Muted text: #94A3B8
- Border color: #E8E6DF (warm, not cold gray)
- Glassmorphism surfaces: rgba(255, 255, 255, 0.72) with backdrop-filter blur(16px) and border 1px solid rgba(255,255,255,0.9)
- Dark overlay panels: #0F1A14 at 94% opacity (used for modals, command palette)

GLASSMORPHISM RULES:
- All floating cards, stat widgets, and overlay panels use glass effect
- background: rgba(255, 255, 255, 0.65), backdrop-filter: blur(20px) saturate(180%), border: 1px solid rgba(255,255,255,0.85), box-shadow: 0 8px 32px rgba(26,77,46,0.08)
- Glass cards sit ON TOP of subtle gradient mesh backgrounds, not flat color
- The mesh background underneath: soft radial gradients — pale sage green (#E8F0E9) to warm cream (#F7F6F2) to very pale gold (#FDF8EE)

SHADOWS AND DEPTH:
- Cards: box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(26,77,46,0.06)
- Elevated panels: box-shadow: 0 4px 6px rgba(0,0,0,0.03), 0 16px 48px rgba(26,77,46,0.10)
- Hover state: shadow deepens + card lifts 2px (translateY(-2px))
- No hard drop shadows. No colored glow effects (except subtle green glow on primary CTA button)

BUTTONS:
- Primary CTA: background #1A4D2E, text white, border-radius 8px, padding 12px 24px, Syne font, letter-spacing 0.02em. On hover: background #143D24, subtle green glow box-shadow: 0 0 0 3px rgba(26,77,46,0.15)
- Secondary: white background, border 1.5px solid #1A4D2E, text #1A4D2E, same radius
- Ghost: no border, text #4A5568, hover background rgba(26,77,46,0.06)
- Destructive: background #FEF2F2, text #DC2626, border 1px solid #FECACA
- All buttons: font-weight 500, no all-caps, subtle transition 150ms ease

CHART COLORS (consistent across all graphs):
- Primary line / area fill: #1A4D2E
- Area fill gradient: #1A4D2E at 20% opacity fading to 0%
- Benchmark line: #D4A843 (gold, dashed)
- Candlestick up: #16A34A
- Candlestick down: #DC2626
- Grid lines: #F0EEE8 (very faint warm gray)
- Axis labels: DM Mono, 11px, #94A3B8

ICONOGRAPHY:
- Use Lucide icons throughout — 20px default, 1.5px stroke weight
- Never filled icons. Always outline stroke style.
- Icon color matches text color in context (never standalone colored icons except status indicators)

BADGES AND TAGS:
- Sector tags: pill shape, background rgba(26,77,46,0.08), text #1A4D2E, Syne font, 11px, padding 3px 10px
- Status badges: "Active" → green pill. "Paused" → amber pill. "Failed" → red pill. Subtle backgrounds only.
- Plan tier badge: gold gradient pill for Pro/Institution — background linear-gradient(135deg, #D4A843, #F0C040), text #0F1A14

SPACING:
- Base unit: 8px
- Content max-width: 1320px
- Section padding: 32px 40px on desktop
- Card inner padding: 24px
- Between card grid items: 20px gap

=============================================================
SCREEN 1 — LANDING PAGE (Marketing, Not Logged In)
=============================================================

HERO SECTION:
Full viewport height. Background is a warm off-white (#F7F6F2) with a large abstract mesh gradient in the upper right — a soft bloom of pale green and warm gold, very subtle, not distracting. Think a watercolor wash that fades into the background. On top of this, position a glass panel (glassmorphism card) at 65% viewport width, left-aligned, containing:
- Small pill label at top: "Market Intelligence Platform" in Syne, all lowercase, gold accent dot before it
- Main headline spanning 3 lines: "Research smarter. Trade with proof." in Playfair Display, 72px, #0F1A14, tight leading 1.1
- Sub-headline below in DM Sans 18px, #4A5568: "Backtest any strategy on Indian markets, screen stocks with AI rationale, and get personalized market digests every 3 hours — all without a single rupee of risk."
- Two CTA buttons side by side: Primary "Start Free Research" and Ghost "Watch 90-sec demo →"
- Three small trust indicators below CTAs (inline, horizontal): a green checkmark icon + "No SEBI advisory — pure research tools", another + "Free tier, no credit card", another + "Trusted by 1,200+ investors"

RIGHT SIDE of hero: A floating dashboard mockup — a glass card showing a mini candlestick chart of RELIANCE with a small equity curve overlaid, a "Backtest Result" badge showing "+18.4% CAGR", and a "3 stocks passed today's screen" notification. This floats slightly tilted at -3deg rotation, casting a soft shadow. Behind it, a second slightly larger glass card peeking out from behind (layered depth effect).

STATS BAR below hero (full width, warm white background with top/bottom border lines):
4 statistics in a row — "1,248 active researchers", "14,300+ backtests run", "₹3.2Cr simulated in paper trades", "4.2% avg alpha generated" — each in DM Mono for the number, DM Sans for the label, separated by vertical dividers.

FEATURES SECTION (3-column grid):
Each feature card is a glass card with hover lift. Cards have a small icon in a soft green circle at top, heading in Syne, body in DM Sans. Features: Backtesting Engine, Stock Screener, Paper Trading, AI Research Reports, Smart Alerts, Email Digests. Cards are NOT equal height — let them breathe naturally.

TESTIMONIALS SECTION:
3 quotes in cards. Light background, gold left border on each card. Attribution in DM Mono small caps style. Keep text very short — 1-2 sentences max. Names like "Rahul M., Bangalore" — anonymous but specific.

PRICING SECTION:
4 plan cards in a row. The "Pro Analyst" card is slightly larger, elevated more, and has a "Most Popular" gold badge on top right corner. Each card shows plan name (Syne bold), price (DM Mono large), feature list with checkmarks, and a CTA button. Glass effect on all cards, but Pro card has an additional very subtle sage-green gradient border (1.5px, gradient from #1A4D2E to #D4A843).

FOOTER:
Dark footer — #0F1A14 background. Logo left, three link columns center, social icons right. Gold accent on hover links. Small disclaimer text at very bottom in #4A5568 about SEBI, educational purpose only.

=============================================================
SCREEN 2 — MAIN DASHBOARD (After Login)
=============================================================

LAYOUT:
Fixed left sidebar (240px wide), main content area, optional right panel (300px) that slides in for context. Sidebar background: #FFFFFF with right border #E8E6DF. Main content background: #F7F6F2.

TOP NAVIGATION BAR (inside main content, not full width):
32px height. Left: Breadcrumb "Dashboard" in Syne. Center: Global search bar — glass style, placeholder "Search stocks, strategies, reports..." with Cmd+K shortcut shown. Right: Notification bell with unread dot, user avatar circle (initials), plan tier badge (gold "PRO").

SIDEBAR:
Logo at top (AlgoVeda text in Playfair Display + small leaf icon in green). Navigation items in DM Sans 14px: Dashboard, Screener, Backtest, Paper Trade, Portfolio, Alerts, Research, Settings. Active item: solid green left border (3px), green text, soft green background tint. Hover: same but lighter. Bottom of sidebar: user card with avatar, name, plan tier, and "Upgrade Plan" link in gold.

MAIN CONTENT — DASHBOARD PAGE:

ROW 1 — MARKET SNAPSHOT (horizontal strip of 5 glass stat cards):
Each card shows: index name (Syne 12px muted), current value (DM Mono 22px bold black), change amount and percent (DM Mono 13px, green or red colored). Cards for: Nifty 50, Sensex, Nifty Bank, India VIX, USD/INR. Each card has a tiny sparkline (7-day) in the background of the card, very faint, matching green/red. The cards have glass effect sitting on a soft gradient mesh strip.

ROW 2 — TWO COLUMN LAYOUT:

LEFT COLUMN (65% width):
Main portfolio equity curve chart. Large, clean area chart with: title "Portfolio Performance" in Syne 16px, time range tabs (1W, 1M, 3M, 6M, 1Y, All) as pill tabs, the green area chart below, two lines — portfolio (green solid) and Nifty 50 benchmark (gold dashed). Below the chart: 3 inline metrics — Total Return, CAGR, Sharpe Ratio — each in a mini stat strip. Chart uses lightweight-charts style. No border on the chart itself — the axis and grid lines provide all structure.

RIGHT COLUMN (35% width):
Top: "Today's AI Picks" card — glass effect, heading with sparkle icon, 3 stock rows each showing: ticker (DM Mono bold), company name (DM Sans), sector pill tag, and a small AI rationale text in 12px italic DM Sans. Below each: a row of 3 mini metrics (P/E, RSI, 3M Return). A "View Full Screen" link at bottom in green.

Below that: "Active Alerts" mini card — shows 2-3 recent alert items with icon, description, and time. Red dot indicators on triggered ones.

ROW 3 — THREE COLUMN LAYOUT:
Left: "Recent Backtests" — table-style list showing strategy name, symbol, CAGR result (colored), date run, and a mini equity curve sparkline thumbnail. Right-most column has a "View" link.
Center: "Paper Portfolio Today" — mini P&L card showing virtual portfolio value, today's change, top gainer/loser row.
Right: "Next Email Digest" countdown card — shows time until next digest, list of what will be included (checkboxes), and "Edit Preferences" link.

=============================================================
SCREEN 3 — BACKTEST RESULTS PAGE
=============================================================

LAYOUT:
Full-width content with max-width 1320px. No sidebar in this view — distraction-free. But breadcrumb navigation at top: "Backtest › RELIANCE › RSI Mean Reversion".

TOP SECTION — RESULT HERO:
A large glass panel spanning full width. Background: soft diagonal gradient from pale green tint to cream. Inside:
- Left: Strategy name "RSI Mean Reversion" in Playfair Display 32px. Below: symbol badge "RELIANCE.NSE" in DM Mono, period "Jan 2020 – Dec 2024", interval "Daily". Status badge "Completed" in green.
- Right: 4 huge KPI numbers in a 2x2 grid — each is a mini glass card inside the main card:
  * "+18.4% CAGR" — number in DM Mono 40px bold green, label below
  * "1.84 Sharpe" — number in DM Mono 40px, label below
  * "-11.2% Max DD" — red number
  * "68% Win Rate" — green number
- Below the KPIs, a thin comparison strip: "Benchmark (Nifty 50): +14.2% CAGR · Alpha generated: +4.2%"

MAIN CHART AREA:
Equity curve chart spanning full width, 320px tall. Green area chart for strategy, gold dashed line for benchmark. Smooth curves. Below the chart: a drawdown chart in soft red (inverted area). Both charts share the same x-axis. Time range selector tabs above.

METRICS GRID (below charts):
A 3-column grid of metric cards — each glass card with a metric name, value, and a small contextual note. Metrics: Total Return, CAGR, Annualized Volatility, Sharpe Ratio, Sortino Ratio, Calmar Ratio, Max Drawdown, Max DD Duration, Win Rate, Profit Factor, Total Trades, Avg Win/Loss Ratio. Each card has a subtle icon matching the metric category. Cards for "good" values have a faint green left border. Cards for "concerning" values (like high volatility) have a faint amber border.

MONTHLY RETURNS HEATMAP:
A table showing years as rows, months as columns. Each cell shows the return % for that month. Color scale: deep green for best months, deep red for worst, cream/white for near-zero. DM Mono font in cells. Small tooltip on hover showing exact figure.

AI ANALYSIS SECTION:
A distinct card with a subtle different background (slightly darker cream). Small "AI Analysis" label with a sparkle icon in gold. The text content is a 200-word analysis in DM Sans 15px, good line height. Quote marks in Playfair Display decorating the card. Groq model attribution in tiny muted text at bottom.

TRADE LOG TABLE:
Full-width table. Columns: Date, Action (BUY/SELL badge), Price (DM Mono), Qty, P&L (colored green/red), Cumulative Return. Alternating row backgrounds (white / #F7F6F2). Sortable column headers. Pagination at bottom.

=============================================================
SCREEN 4 — STOCK SCREENER PAGE
=============================================================

LAYOUT:
Split layout. Left panel (320px): filter sidebar. Right panel: results area.

FILTER SIDEBAR:
Background #FFFFFF, right border. Top: "Screener" heading in Syne, and a "Reset All" ghost button. Filter groups with accordion expand/collapse:
- Fundamental Filters: range sliders for P/E (0-100), P/B (0-20), ROE min (%), Market Cap selector (chips: Micro/Small/Mid/Large).
- Technical Filters: RSI range slider with two handles, MA Position (checkboxes: Above 50EMA, Above 200EMA), Volume filter (dropdown: Normal / 2x average / 3x average).
- Momentum: Return period chips (1M, 3M, 6M, 1Y) with min% input.
- Sector: multi-select pill chips for each sector, with count indicators.

Each filter group has a subtle glass card container. Active filters show a count badge on the group header. At the bottom of sidebar: large "Run Screen" primary green button.

RESULTS HEADER:
Above the results grid: "47 stocks matched" in Syne bold, last updated timestamp in muted small text. Sort by dropdown on the right. View toggle: Grid / Table icons.

RESULTS GRID (card grid, 3 columns):
Each stock card is a glass card. Contains:
- Top row: Ticker (DM Mono bold 16px) + Exchange badge + Sector pill
- Company name in DM Sans 14px gray
- Price (DM Mono 20px) + daily change (colored)
- 3 metric pills in a row: P/E · P/B · RSI — small rounded containers
- A tiny 30-day price sparkline spanning the bottom of the card
- "Why this stock?" expandable section — clicking reveals a 2-sentence AI rationale in italic DM Sans with a gold accent left border
- Bottom row: "Add to Watchlist" ghost button + "Backtest This" ghost button

RESULTS TABLE VIEW (alternate):
Full-width table with columns: Symbol, Company, Sector, CMP, Change%, P/E, P/B, ROE, RSI, 52W High/Low%, 3M Return, Score, Action. Compact row height. DM Mono for all numbers. Color-coded cells for RSI (green if 30-50 range, amber if near overbought). Score column shows a mini progress bar (green fill).

AI SUMMARY BAR (top of results, full width):
A distinct strip with subtle gold-tinted glass background. Small sparkle icon + "AI Summary:" label, then a one-liner in italic DM Sans summarizing the screen results (generated by Groq). Very tasteful, doesn't overpower the data.

=============================================================
SCREEN 5 — EMAIL DIGEST PREFERENCES SETTINGS PAGE
=============================================================

LAYOUT:
Centered single-column layout, max 680px wide, comfortable reading width. Generous white space.

PAGE HEADER:
"Email Preferences" in Playfair Display 32px. Subtitle in DM Sans: "Control exactly what you receive and when." Clean, editorial.

SECTION 1 — DIGEST FREQUENCY:
A horizontal selector showing frequency options as large pill cards in a row: 1H / 2H / 3H / 4H / 6H / 12H / Daily. Each pill is a card with the time, a small description below ("Ideal for intraday awareness"), and a radio selection. Selected state: green background, white text, slight elevation. Unselected: white border, gray text. Pro badge on 1H and 2H options (locked for free users, dimmed with lock icon).

SECTION 2 — CONTENT PREFERENCES:
Heading "What to include in your digest" in Syne. Below: a list of toggle items, each as a full-width row with: icon on left, label + description, and a large iOS-style toggle on the right. Items: "Nifty 50 Snapshot", "Your Watchlist Movers", "AI Market Commentary", "Today's Screener Picks" (Pro badge), "Top Financial News", "Sector Performance", "FII/DII Activity", "Macro Indicators". Enabled toggles show green. Disabled toggles gray. Pro-only items show dimmed with gold "PRO" badge.

SECTION 3 — PREVIEW:
A collapsible section showing "Preview last digest sent to you". Inside: a scaled-down (70%) rendering of the actual email digest design. The email preview sits inside a mock browser/email-client frame (chrome window decoration at the top — minimal, just the gray browser bar). The email itself shows the actual layout from the digest with sample data. Very impressive visual — proves value immediately.

SECTION 4 — TEST EMAIL:
A simple row: "Send a test digest to rahul@email.com" with a "Send Test Now" secondary button. Below: last sent timestamp in muted DM Sans.

SAVE BUTTON:
Full-width primary green button "Save Preferences" with a soft green glow. Sticky at bottom on mobile, inline at bottom on desktop.

=============================================================
SCREEN 6 — PAPER TRADING DASHBOARD
=============================================================

LAYOUT:
Standard sidebar layout. Main content area with two major sections: portfolio summary top, positions table below.

PORTFOLIO HEADER CARD:
Full-width glass card with a subtle green mesh gradient background. Contains:
- Left: "Virtual Portfolio" label in Syne muted + portfolio name "My Paper Strategy". Below: virtual cash balance "₹98,430" in DM Mono 36px bold, and below that in green "+₹8,430 (+9.4%) since inception"
- Center: 3 stat blocks — Today's P&L (+₹1,240 green), Open Positions (8), Total Orders (34)
- Right: small 30-day equity curve sparkline (just the line, no axes, white/cream background)
- A "Place Order" primary button in the top right corner of the card

POSITIONS TABLE:
Heading "Open Positions" in Syne. Full-width table: Symbol, Qty, Avg Cost (DM Mono), CMP (live, DM Mono, with subtle pulse animation on update), P&L (colored + %), Day Change, Action column (Sell ghost button). 

Each row has a very subtle left-colored border — green if position is in profit, red if in loss. Row height is comfortable, not cramped. On hover: row background goes to a very soft sage tint.

Below the table: two smaller tables side by side — "Recent Orders" and "Completed Trades".

PLACE ORDER MODAL (overlay):
This is the overlay/modal component. Dark overlay behind (rgba(15,26,20,0.7) blur). Modal itself is a large glass card — NOT dark, stays glass white. Inside:
- Modal header: "Place Paper Order" + close X button
- Symbol search input at top with autocomplete
- Order type selector: 4 tab pills — Market / Limit / SL / SL-M
- Buy/Sell toggle: two large pill buttons, Buy highlighted green, Sell red when selected
- Input fields: Quantity (DM Mono style input), Limit Price (shows only when Limit selected), Stop Trigger
- Order summary strip at bottom: "Estimated Value: ₹1,42,500" in DM Mono
- Two buttons: "Validate Order" (ghost) and "Place Order" (primary green)
- A small disclaimer line at very bottom in muted text

=============================================================
SCREEN 7 — AI RESEARCH REPORT (Full Page View)
=============================================================

LAYOUT:
Distraction-free reading layout. Max 800px wide content, centered. Think editorial — like a premium investment research PDF but on the web.

REPORT HEADER:
At the very top: a wide banner with a subtle green diagonal gradient. Inside: "Research Report" label in Syne gold + date. Below: the company name "Titan Company Limited" in Playfair Display 48px white-on-dark (this banner is the dark exception — #0F1A14 at 92%). Sector badge, exchange badge. A row of 4 stats: CMP ₹3,892, Target ₹4,400, Rating STRONG BUY (in green pill), Upside +13%.

After the dark banner, the content goes back to warm white background.

RATING BOX:
A prominent glass card just below the banner. Shows the AI rating in large with a color-coded meter/gauge visual (a semicircle arc going from red left to green right, with the needle pointing to the appropriate zone). Not a standard bar — an elegant arc. Rating text "Strong Buy" in Playfair Display 24px green. Price target in DM Mono. One-line thesis in DM Sans italic.

REPORT BODY:
Sections in Syne headings (h2, h3), body in DM Sans 16px, 1.7 line height. Section headings have a thin green left border (2px, #1A4D2E, 20px height). Sections: Executive Summary, Business Overview, Financial Analysis, Technical Analysis, Risk Factors, Conclusion.

FINANCIAL DATA TABLES:
Inline tables with key financials — Revenue, EPS, P/E, ROE across 4 years. Clean table, warm borders, alternating rows, DM Mono numbers.

KEY METRICS SIDEBAR:
For the "Financial Analysis" section, a small floating sidebar-style card sits to the right (using CSS float or column layout) showing 6 key metrics in a mini card format. Very clean, doesn't interrupt reading flow.

CHARTS INLINE:
Two charts embedded in the report — a revenue/profit bar chart and a price history line chart with key events annotated (small label pins on the line). Charts are compact (320px height) and share the global chart design language.

BOTTOM FOOTER of report:
Full AI disclaimer in DM Sans 12px, #4A5568. Model attribution. Report generation timestamp. "Download PDF" secondary button and "Share Report" ghost button.

=============================================================
ADDITIONAL COMPONENT NOTES — APPLY EVERYWHERE
=============================================================

LOADING STATES:
Skeleton loaders use a warm gray shimmer (#E8E6DF animated to #F5F3EE). No spinning circles. Just elegant shimmer on card-shaped boxes.

EMPTY STATES:
When a section has no data (e.g., no backtests yet), show a centered illustration area — a minimal line drawing (SVG-style) relevant to the feature, a heading in Playfair Display, and a primary CTA button. Not generic. The BACKTEST empty state shows a tiny candlestick chart outline. The ALERTS empty state shows a bell outline.

TOOLTIPS:
Dark background (#0F1A14 at 95%), white DM Sans 12px text, 4px border radius, no arrow, soft appear animation (scale from 0.95 + fade). Show on hover for all chart data points and metric cards.

NOTIFICATIONS / TOASTS:
Bottom-right position. Glass card style. Icon on left (colored by type). Title in Syne 13px, description in DM Sans 12px. Auto-dismiss with a thin green progress bar at the bottom of the card depleting over 4 seconds.

COMMAND PALETTE (Cmd+K):
Full-screen overlay with dark blur background. Centered modal, glass-white, very large (600px wide). Large search input at top. Below: categorized results with keyboard navigation. Categories: Stocks, Strategies, Reports, Actions, Settings. Keyboard shortcut badges (↵ Enter, ↑↓ navigate) shown in muted DM Mono style.

MOBILE RESPONSIVE:
On mobile (<768px): sidebar collapses to bottom tab bar (5 tabs: Home, Screen, Backtest, Portfolio, More). Cards stack vertically. Font sizes scale down gracefully. Touch targets minimum 44px. The command palette becomes a full-screen bottom sheet on mobile.

DATA REFRESH INDICATOR:
Top-right of any live data section: a very subtle "Live" dot — a small green circle with a slow pulse animation (2s loop). When data is refreshing: the dot turns amber. When error: red. DM Mono 11px "Live" label beside it.

MARKET HOURS BANNER:
If market is closed, a thin strip (32px) at the very top of the main content area in a warm amber tint (#FFF7E6) with a small clock icon: "Market closed · Opens Mon 9:15 AM IST" in DM Sans 13px. Dismissable with an X. Only shown when market is not trading.