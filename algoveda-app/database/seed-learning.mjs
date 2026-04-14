// database/seed-learning.mjs
// Run: node database/seed-learning.mjs
// Seeds all 15 chapters from CONTENTS.MD into learning_modules + quiz_questions

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config({ path: '.env.local' });

const __dirname = dirname(fileURLToPath(import.meta.url));

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const modules = [
  {
    slug: 'intro-stock-market',
    title: 'Introduction to the Stock Market',
    description: 'What is the stock market, why companies list, why people invest, and investing vs trading.',
    order_index: 1,
    is_premium: false,
    content: [
      { heading: 'What Is the Stock Market?', body: 'The stock market is where ownership pieces of companies — called shares or stocks — are bought and sold. When you buy a share, you become a part-owner of that company.' },
      { heading: 'Why Companies List Shares', body: 'Companies raise money from the public by listing on a stock exchange through an IPO (Initial Public Offering). Investors get ownership; companies get capital.' },
      { heading: 'Why People Invest', body: 'People invest for wealth creation over time, passive income through dividends, capital growth, and protection against inflation.' },
      { heading: 'Investing vs Trading', body: 'Investing is long-term wealth creation using fundamentals and patience. Trading is short-term price gains using technical analysis and timing. Both require skill and discipline.' },
    ]
  },
  {
    slug: 'indian-market-basics',
    title: 'Indian Stock Market Basics',
    description: 'NSE, BSE, SEBI, indices, sectors, market participants, and trading hours.',
    order_index: 2,
    is_premium: false,
    content: [
      { heading: 'NSE and BSE', body: 'India has two major exchanges — BSE (benchmark: SENSEX, 30 stocks) and NSE (benchmark: NIFTY 50, 50 stocks). Both are regulated by SEBI.' },
      { heading: 'Stocks, Indices, and Sectors', body: 'Stocks are individual shares. Indices (NIFTY 50, SENSEX) measure overall market performance. Sectors group companies in the same industry.' },
      { heading: 'Market Participants', body: 'Retail investors, FIIs (foreign funds), DIIs (Indian funds like LIC), HNIs, and market makers all participate. FII flows often drive short-term market direction.' },
      { heading: 'Trading Hours', body: 'Pre-market: 9:00–9:15 AM IST. Regular session: 9:15 AM–3:30 PM IST. Post-market: 3:40–4:00 PM IST. Markets open Monday–Friday excluding public holidays.' },
    ]
  },
  {
    slug: 'reading-stock-charts',
    title: 'How to Read a Stock Chart',
    description: 'Candlesticks, timeframes, volume, and trends explained clearly.',
    order_index: 3,
    is_premium: false,
    content: [
      { heading: 'Candlestick Basics', body: 'Each candlestick shows Open, High, Low, Close (OHLC). Green candles mean the price closed above the open. Red candles mean it closed below. Wicks show the full range of price movement.' },
      { heading: 'Timeframes', body: 'Intraday traders use 1–15 min charts. Swing traders use 1–4 hour charts. Daily charts are most common for analysis. Always zoom out before zooming in.' },
      { heading: 'Volume', body: 'Volume is shares traded in a period. Price moves on volume. A breakout on high volume is reliable. On thin volume it often fails. Volume confirms or denies price action.' },
      { heading: 'Trends', body: 'Uptrend: higher highs and higher lows. Downtrend: lower highs and lower lows. Sideways: price ranges between support and resistance. Identify the trend before any analysis.' },
    ]
  },
  {
    slug: 'basic-technical-analysis',
    title: 'Basic Technical Analysis',
    description: 'Support, resistance, trendlines, breakouts, and price action fundamentals.',
    order_index: 4,
    is_premium: false,
    content: [
      { heading: 'Support and Resistance', body: 'Support is a price floor where buying steps in. Resistance is a ceiling where selling kicks in. When resistance breaks, it often becomes new support. These are key decision zones.' },
      { heading: 'Trendlines', body: 'Trendlines connect a series of price points to show trend direction. In an uptrend, drawn below lows. In a downtrend, above highs. Valid with at least 2 points; 3+ makes it reliable.' },
      { heading: 'Breakouts and Breakdowns', body: 'A breakout is a convincing move above resistance. A breakdown is a fall below support. Always confirm with volume. False breakouts trap beginners — look for price closing clearly beyond the level.' },
      { heading: 'Price Action Basics', body: 'Price action studies movement without relying on indicators. Key patterns: Pin bar (rejection wick), Inside bar (consolidation), Engulfing candle (reversal signal). Many pros use only price action.' },
    ]
  },
  {
    slug: 'technical-indicators',
    title: 'Important Technical Indicators',
    description: 'Moving averages, RSI, MACD, Bollinger Bands, VWAP, and Stochastics.',
    order_index: 5,
    is_premium: false,
    content: [
      { heading: 'Moving Averages', body: 'SMA gives equal weight to all periods. EMA gives more weight to recent data, reacting faster. Golden Cross (faster MA above slower) = bullish. Death Cross = bearish. 50-day and 200-day are most watched in India.' },
      { heading: 'RSI', body: 'RSI measures speed and magnitude of price change (0–100 scale). Above 70 = overbought. Below 30 = oversold. RSI divergence (price makes new high but RSI does not) signals weakening momentum.' },
      { heading: 'MACD', body: 'MACD shows the relationship between two EMAs (12 and 26 periods) with a 9-period signal line. MACD crossing above signal line = bullish. Below = bearish. Best for confirming trend and momentum shifts.' },
      { heading: 'Bollinger Bands and VWAP', body: 'Bollinger Bands: middle SMA + upper/lower bands 2 standard deviations away. A squeeze (narrow bands) precedes big moves. VWAP is the volume-weighted average price of the day — used by intraday traders to gauge sentiment.' },
    ]
  },
  {
    slug: 'chart-patterns',
    title: 'Chart Patterns and Market Structure',
    description: 'Head and Shoulders, Double Tops/Bottoms, Triangles, Flags, and Pennants.',
    order_index: 6,
    is_premium: false,
    content: [
      { heading: 'Head and Shoulders', body: 'A top reversal pattern: left shoulder, head (highest rally), right shoulder. The neckline break with volume confirms the reversal. Inverse H&S forms at market bottoms and signals an upward reversal.' },
      { heading: 'Double Top and Double Bottom', body: 'Double Top: price tests resistance twice and fails — bearish. Double Bottom: price tests support twice and bounces — bullish. Entry signal is the neckline break between the two peaks or troughs.' },
      { heading: 'Triangles', body: 'Ascending triangle (flat top + rising lows = bullish continuation). Descending triangle (flat bottom + falling highs = bearish). Symmetrical triangle (converging sides = direction uncertain, wait for breakout).' },
      { heading: 'Flags and Pennants', body: 'Short-term consolidations after strong moves. Flags are rectangular; pennants are small triangles. Both are continuation patterns — the stock "rests" before resuming the prior trend. Clear entry and measurable targets.' },
    ]
  },
  {
    slug: 'market-data-parameters',
    title: 'Market Data and Key Parameters',
    description: 'OHLC, volume, market breadth, volatility, delivery %, and gaps.',
    order_index: 7,
    is_premium: false,
    content: [
      { heading: 'OHLC Price Parameters', body: 'Open, High, Low, Close tell the story of each session. A stock closing near its low after a big range suggests seller dominance. Closing near its high shows buyer control. The relationship between these four matters most.' },
      { heading: 'Volume and Turnover', body: 'Volume is shares traded; turnover is value traded. Unusual volume signals major activity. Declining volume during a rally is a warning. Volume at support/resistance levels confirms whether levels hold or break.' },
      { heading: 'Market Breadth', body: 'Advance-Decline ratio shows how many stocks are rising vs falling. If NIFTY is up but most stocks are down, the rally is narrow and weak. A broad rally with most stocks rising is far more reliable.' },
      { heading: 'Delivery % and Gap Analysis', body: 'High delivery % (above 60%) on rising stocks = genuine buying interest. Gaps occur when a stock opens above or below previous close. Breakaway gaps are significant. Gap fill is common but not guaranteed.' },
    ]
  },
  {
    slug: 'fundamental-analysis',
    title: 'Fundamental Analysis Basics',
    description: 'Revenue, EPS, P/E, P/B, ROE, ROCE, debt, and cash flow explained.',
    order_index: 8,
    is_premium: false,
    content: [
      { heading: 'Revenue, Profit, and EPS', body: 'Revenue is total earnings. Net Profit is after all expenses and taxes. EPS (Earnings Per Share) = Net Profit / Total Shares. Growing EPS quarter over quarter is a key positive signal.' },
      { heading: 'Key Valuation Ratios', body: 'P/E (Price to Earnings): how much you pay for ₹1 of profit. P/B (Price to Book): price relative to net assets. Always compare ratios to historical values and sector peers — never in isolation.' },
      { heading: 'Efficiency Ratios', body: 'ROE (Return on Equity): how efficiently a company uses shareholder money — above 15% is strong. ROCE (Return on Capital Employed): broader measure including debt. Both reward quality management.' },
      { heading: 'Debt and Cash Flow', body: 'Debt-to-Equity shows how much is borrowed vs owned. High D/E is risky in rising rate environments. Free Cash Flow — the actual cash after expenses — is the truest measure of financial health. Profitable companies can still be cash-poor.' },
    ]
  },
  {
    slug: 'sectors-market-themes',
    title: 'Sectors and Indian Market Themes',
    description: 'Banking, IT, FMCG, Auto, Pharma, Energy sectors and sector rotation.',
    order_index: 9,
    is_premium: false,
    content: [
      { heading: 'Key Indian Sectors', body: 'Banking (interest rates, credit growth), IT (dollar-rupee, US demand), FMCG (rural demand, inflation), Auto (EV transition, fuel prices), Pharma (FDA approvals, exports), Energy (crude prices, policy).' },
      { heading: 'Cyclical vs Defensive', body: 'Cyclical sectors (Auto, Metals, Banking) rise and fall with the economy. Defensive sectors (FMCG, Pharma, Utilities) are stable in downturns. A balanced portfolio holds both for growth and stability.' },
      { heading: 'Sector Rotation', body: 'Money rotates between sectors as economic conditions change. Early recovery: Banking, Auto lead. Mature growth: IT, FMCG. Slowdown: Healthcare, Utilities. Tracking rotation helps you position in the right sectors.' },
      { heading: 'Sector Context', body: 'A rising sector lifts even average stocks. A falling sector drags even quality companies. Always check sector trend before analyzing individual stocks. Macro environment shapes individual stock opportunities.' },
    ]
  },
  {
    slug: 'market-sentiment-psychology',
    title: 'Market Sentiment and Psychology',
    description: 'Fear, greed, news impact, institutional vs retail behavior, and emotional traps.',
    order_index: 10,
    is_premium: false,
    content: [
      { heading: 'Fear and Greed', body: 'Markets are driven by two emotions. Greed creates dangerous overvaluations at tops. Fear creates the best buying opportunities at bottoms. "Be cautious when others are excited, look for opportunity when others are afraid."' },
      { heading: 'News Impact', body: '"Buy the rumor, sell the news" is classic — markets price in anticipated events before they happen. Bad news in a bull market is absorbed quickly. Good news in a bear market rarely sustains a rally. Price reaction matters more than the news itself.' },
      { heading: 'Institutional vs Retail', body: 'Institutions do deep research and drive long-term trends. Retail investors often react emotionally — entering at peaks and exiting at bottoms. Tracking institutional flows (FII/DII data) gives useful signals about where informed money is moving.' },
      { heading: 'Emotional Traps', body: 'Anchoring (refusing to accept a loss), FOMO (buying at the top), Loss Aversion (selling winners early, holding losers), Herding (following the crowd). Protection: a clear written trading plan and the discipline to follow it.' },
    ]
  },
  {
    slug: 'market-events-crisis',
    title: 'Market Events and Crisis Behavior',
    description: 'Wars, pandemics, elections, interest rates, inflation, and how markets react.',
    order_index: 11,
    is_premium: false,
    content: [
      { heading: 'Wars and Geopolitical Events', body: 'Conflicts cause immediate sell-offs as uncertainty spikes. Investors flee to safe havens (gold, USD). Indian markets are especially sensitive to FII outflows during global tensions. History shows markets in unaffected regions recover quickly once the shock passes.' },
      { heading: 'Pandemics', body: 'COVID-19 caused one of the fastest crashes ever — then one of the fastest recoveries. Panic selling at the bottom locks in losses. Government and central bank intervention can dramatically reverse market direction. Crises create buying opportunities for patient investors.' },
      { heading: 'Elections and Interest Rates', body: 'Elections create short-term volatility — markets dislike uncertainty more than any specific result. Once results are declared, clarity restores stability. RBI rate hikes hurt debt-heavy companies and growth stocks. Rate cuts stimulate markets, especially banking and real estate.' },
      { heading: 'How Markets Behave in Uncertainty', body: 'Pattern: sharp sell-off → overshooting beyond fundamentals → recovery faster than most expect → new opportunities emerge. Understanding these stages prevents panic decisions at the worst moments.' },
    ]
  },
  {
    slug: 'risk-money-management',
    title: 'Risk and Money Management',
    description: 'Position sizing, stop loss, risk-reward ratios, and avoiding overtrading.',
    order_index: 12,
    is_premium: false,
    content: [
      { heading: 'Position Sizing', body: 'Never risk more than 1–2% of total capital on a single trade. With ₹1,00,000 capital, maximum risk per trade = ₹1,000–₹2,000. Even 10 consecutive losses only depletes 10–20% of the account. Survival first.' },
      { heading: 'Stop Loss', body: 'A stop loss is a pre-defined exit price if a trade goes wrong. Mandatory — not optional. Before entering, ask: "At what price is my analysis proven wrong?" Place the stop there. Never move it down based on hope.' },
      { heading: 'Risk-Reward Ratio', body: 'Calculate potential gain vs potential risk before every trade. Minimum target: 1:2. Ideal: 1:3. At 1:3 risk-reward, even a 40% win rate is profitable over many trades. Math beats hope.' },
      { heading: 'Overtrading and Revenge Trading', body: 'Overtrading means too many positions — more exposure, higher costs, worse decisions. Revenge trading (entering immediately after a loss to "win it back") turns small losses into catastrophic ones. After a loss: step away, review, re-enter only when conditions are clearly favorable.' },
    ]
  },
  {
    slug: 'backtesting',
    title: 'Backtesting Your Strategy',
    description: 'What backtesting means, why it matters, how to test, and avoiding overfitting.',
    order_index: 13,
    is_premium: false,
    content: [
      { heading: 'What Backtesting Is', body: 'Backtesting tests a trading strategy against historical data to see how it would have performed. Instead of risking real money, you apply rules to past charts and measure results: win rate, average gain, max drawdown.' },
      { heading: 'Why It Matters', body: 'Backtesting answers: "Does my strategy work or does it just feel like it works?" Without data, you rely on gut — unreliable in markets. AlgoVeda\'s backtesting engine lets you test ideas on historical NSE data.' },
      { heading: 'How to Test a Strategy', body: '1. Define rules precisely (entry, stop, target, exit). 2. Apply to historical data and record every triggered trade. 3. Calculate win rate, average win/loss, total return, max drawdown. 4. Calculate expectancy: (Win% × Avg Win) − (Loss% × Avg Loss) — positive = edge.' },
      { heading: 'Avoiding Overfitting', body: 'Overfitting: tuning a strategy to fit past data perfectly. It then fails on new data. Signs: too many specific rules, 80%+ win rate, no drawdowns. Fix: keep rules simple, test on multiple time periods, accept natural variability in results.' },
    ]
  },
  {
    slug: 'paper-trading',
    title: 'Paper Trading',
    description: 'What paper trading is, why beginners need it, and how to learn from it.',
    order_index: 14,
    is_premium: false,
    content: [
      { heading: 'What Paper Trading Is', body: 'Paper trading simulates real trades — entry, management, exit — without real money. You track the same live prices with the same rules you would use with real capital, but gains and losses are virtual.' },
      { heading: 'Why Beginners Should Start Here', body: 'Jumping in with real money before building a consistent process is the most common beginner mistake. Paper trading lets you practice, experience emotional patterns, find strategy flaws, and build discipline before capital is at risk.' },
      { heading: 'How to Get Most from It', body: 'Treat paper trades exactly as you would real trades — same position size rules, same stop losses, same discipline. If you take positions you would never take with real money, the exercise loses its entire value.' },
      { heading: 'Learning by Reviewing', body: 'After each paper trade, review: Did you follow rules? Was entry near a key level? Was risk-reward favorable? What happened and why? The most important learning is in the review, not the trade. A simple journal reveals patterns in your mistakes over time.' },
    ]
  },
  {
    slug: 'research-platform',
    title: 'Research Using the Platform',
    description: 'Screening stocks, comparing candidates, building a watchlist, and research workflow.',
    order_index: 15,
    is_premium: false,
    content: [
      { heading: 'Screening Stocks', body: 'The screener filters thousands of listed Indian stocks to a focused shortlist. Example filters: price above 200-day EMA (uptrend), RSI 40–60 (not extreme), delivery % above 50% (genuine buying), P/E below sector average (potential value).' },
      { heading: 'Comparing Stocks', body: 'Side-by-side comparison lets you evaluate multiple candidates in the same sector. Compare price performance, volume trends, fundamentals, and technical indicators to find the strongest in a sector.' },
      { heading: 'Building a Watchlist', body: 'A watchlist contains stocks you have researched and want to monitor. Add stocks you like but are not ready to trade. Monitor their price action, volume, and key levels over days and weeks before making a decision.' },
      { heading: 'Your Research Workflow', body: '1. Screen for candidates. 2. Check sector trend. 3. Read the chart on multiple timeframes. 4. Evaluate fundamentals. 5. Identify key technical levels. 6. Define entry, stop, and target. 7. Add to watchlist or execute in paper trading.' },
    ]
  },
];

const quizQuestions = [
  // Chapter 1 — Intro
  { module_slug: 'intro-stock-market', question: 'What does buying a share of a company mean?', options: ['You are lending money to the company', 'You become a part-owner of the company', 'You are guaranteed a fixed return', 'You get a company salary'], correct_answer: 1, explanation: 'A share represents partial ownership — even a tiny fraction — of a company.', difficulty: 'easy', order_index: 1 },
  { module_slug: 'intro-stock-market', question: 'What is an IPO?', options: ['Indian Price Oscillator', 'Initial Public Offering — first sale of shares to the public', 'International Portfolio Option', 'Internal Profit Order'], correct_answer: 1, explanation: 'An IPO is when a company first lists its shares on a stock exchange to raise capital from the public.', difficulty: 'easy', order_index: 2 },
  { module_slug: 'intro-stock-market', question: 'Which best describes investing compared to trading?', options: ['Investing is short-term; trading is long-term', 'Both use only technical analysis', 'Investing is long-term wealth creation; trading seeks short-term price gains', 'Trading is safer than investing'], correct_answer: 2, explanation: 'Investing uses fundamentals and patience (months to years). Trading uses technicals and timing (minutes to weeks).', difficulty: 'medium', order_index: 3 },
  // Chapter 2 — Indian Basics
  { module_slug: 'indian-market-basics', question: 'What index does NSE use as its benchmark?', options: ['SENSEX', 'NIFTY BANK', 'NIFTY 50', 'BSE 500'], correct_answer: 2, explanation: 'NIFTY 50 tracks 50 large-cap Indian companies on the National Stock Exchange.', difficulty: 'easy', order_index: 1 },
  { module_slug: 'indian-market-basics', question: 'What does SEBI do?', options: ['Sets interest rates in India', 'Regulates and protects the stock market for fair trading', 'Issues government bonds', 'Manages currency exchange rates'], correct_answer: 1, explanation: 'SEBI (Securities and Exchange Board of India) is the regulator of Indian capital markets.', difficulty: 'easy', order_index: 2 },
  { module_slug: 'indian-market-basics', question: 'When does the regular trading session begin in India?', options: ['8:00 AM IST', '9:00 AM IST', '9:15 AM IST', '10:00 AM IST'], correct_answer: 2, explanation: 'The regular trading session on NSE and BSE starts at 9:15 AM IST.', difficulty: 'medium', order_index: 3 },
  // Chapter 3 — Charts
  { module_slug: 'reading-stock-charts', question: 'What does a green (bullish) candlestick tell you?', options: ['Price closed below the open', 'Price closed above the open — buyers were in control', 'Price did not move', 'High volume was traded'], correct_answer: 1, explanation: 'A green candle means the closing price was higher than the opening price.', difficulty: 'easy', order_index: 1 },
  { module_slug: 'reading-stock-charts', question: 'What do the wicks (shadows) on a candlestick represent?', options: ['The average price of the day', 'The highest and lowest prices reached, beyond the open/close', 'The volume traded', 'The direction of the next candle'], correct_answer: 1, explanation: 'Wicks show the full price range — the extremes reached beyond the open and close.', difficulty: 'easy', order_index: 2 },
  { module_slug: 'reading-stock-charts', question: 'A breakout on low volume is generally considered:', options: ['Highly reliable — volume doesn\'t matter', 'Suspect and more likely to fail (false breakout)', 'More significant than a high-volume breakout', 'A guaranteed trend continuation'], correct_answer: 1, explanation: 'Volume confirms breakouts. Low-volume breakouts are unreliable and frequently reverse.', difficulty: 'medium', order_index: 3 },
  // Chapter 4 — Technical Analysis
  { module_slug: 'basic-technical-analysis', question: 'When a resistance level is broken convincingly, what typically happens to it?', options: ['It disappears from the chart', 'It becomes the new support level', 'It becomes an even stronger resistance', 'Nothing — it stays as resistance'], correct_answer: 1, explanation: 'Broken resistance often flips to become new support — a well-known principle in technical analysis.', difficulty: 'medium', order_index: 1 },
  { module_slug: 'basic-technical-analysis', question: 'What is a "false breakout"?', options: ['A breakout on very high volume', 'When price moves beyond a key level but quickly reverses back', 'A breakout in a very volatile market', 'A breakout confirmed by multiple indicators'], correct_answer: 1, explanation: 'A false breakout traps traders by briefly exceeding a level but then reversing — a common beginner trap.', difficulty: 'medium', order_index: 2 },
  // Chapter 5 — Indicators
  { module_slug: 'technical-indicators', question: 'What does an RSI reading above 70 typically suggest?', options: ['The stock is undervalued and a buy signal', 'Oversold conditions — potential buying opportunity', 'Overbought conditions — the stock may have risen too fast', 'The stock has no momentum'], correct_answer: 2, explanation: 'RSI above 70 indicates overbought conditions — the price may have risen too far, too fast.', difficulty: 'easy', order_index: 1 },
  { module_slug: 'technical-indicators', question: 'What is a "Golden Cross" in moving average analysis?', options: ['When the 50-day SMA crosses below the 200-day SMA (bearish)', 'When the faster MA crosses above the slower MA (bullish signal)', 'When two identical MAs cross each other', 'Any MA crossing the price line'], correct_answer: 1, explanation: 'A Golden Cross occurs when a faster moving average crosses above a slower one — a broadly watched bullish signal.', difficulty: 'medium', order_index: 2 },
  { module_slug: 'technical-indicators', question: 'VWAP is primarily used by which type of trader?', options: ['Long-term investors holding for years', 'Intraday traders tracking same-day price levels', 'Fundamental analysts evaluating company value', 'Macro economists studying interest rates'], correct_answer: 1, explanation: 'VWAP resets daily and shows the volume-weighted average price — primarily used as an intraday benchmark.', difficulty: 'medium', order_index: 3 },
  // Chapter 6 — Patterns
  { module_slug: 'chart-patterns', question: 'What is the key signal to confirm a Head and Shoulders reversal?', options: ['The price touches the head level twice', 'The right shoulder is taller than the left', 'Price breaks below the neckline on volume', 'The RSI reaches 70 at the head'], correct_answer: 2, explanation: 'The neckline break (confirmed by volume) is the standard entry signal for a Head and Shoulders pattern.', difficulty: 'medium', order_index: 1 },
  { module_slug: 'chart-patterns', question: 'An ascending triangle pattern typically signals:', options: ['A bearish reversal — price will fall', 'A bullish continuation — price is likely to break higher', 'A sideways market with no direction', 'A double bottom formation'], correct_answer: 1, explanation: 'Ascending triangles have a flat resistance top and rising lows — usually a bullish continuation pattern.', difficulty: 'medium', order_index: 2 },
  // Chapter 7 — Market Data
  { module_slug: 'market-data-parameters', question: 'A high delivery percentage (above 60%) on a rising stock generally indicates:', options: ['Heavy intraday speculation with no conviction', 'Genuine buying interest — investors intend to hold the shares', 'The stock is overbought and likely to fall', 'Foreign investors are selling'], correct_answer: 1, explanation: 'High delivery % means shares are actually being transferred — evidence of genuine investors, not just speculators.', difficulty: 'medium', order_index: 1 },
  { module_slug: 'market-data-parameters', question: 'What does "market breadth" measure?', options: ['How wide the bid-ask spread is', 'How broadly a market move is shared across individual stocks', 'The total market capitalization', 'The number of listed companies'], correct_answer: 1, explanation: 'Market breadth shows whether a market move is broad (most stocks participating) or narrow (only a few large stocks).', difficulty: 'hard', order_index: 2 },
  // Chapter 8 — Fundamentals
  { module_slug: 'fundamental-analysis', question: 'What does P/E ratio measure?', options: ['How much profit the company made relative to its debt', 'Price you pay for every ₹1 of earnings — a valuation measure', 'The company\'s cash flow efficiency', 'Price relative to book value of assets'], correct_answer: 1, explanation: 'P/E = Price per Share / EPS. Lower P/E may indicate cheaper valuation; always compare to peers.', difficulty: 'easy', order_index: 1 },
  { module_slug: 'fundamental-analysis', question: 'Why is Free Cash Flow considered a better measure than net profit alone?', options: ['It is easier to manipulate through accounting', 'It shows actual cash generated after expenses — a company can appear profitable but be cash-poor', 'It is always higher than net profit', 'It includes the value of future orders'], correct_answer: 1, explanation: 'Free Cash Flow is the real cash left after operating and capital expenditures — harder to manipulate than accounting profits.', difficulty: 'hard', order_index: 2 },
  // Chapter 9 — Sectors
  { module_slug: 'sectors-market-themes', question: 'Which Indian sector is most directly affected by US economic conditions?', options: ['FMCG — consumer goods', 'IT (Information Technology) — exports and dollar revenue', 'Banking — domestic credit growth', 'Pharma — domestic prescriptions'], correct_answer: 1, explanation: 'Indian IT companies earn most revenue from the US. A US slowdown reduces IT spending and impacts Indian IT stocks.', difficulty: 'medium', order_index: 1 },
  { module_slug: 'sectors-market-themes', question: 'Which type of sector typically holds up best during economic slowdowns?', options: ['Auto — people stop buying cars', 'Metals — industrial demand drops', 'Defensive sectors like FMCG and Pharma — essential products', 'Real Estate — construction stops'], correct_answer: 2, explanation: 'Defensive sectors sell essential products regardless of economic conditions — making them more stable in downturns.', difficulty: 'medium', order_index: 2 },
  // Chapter 10 — Psychology
  { module_slug: 'market-sentiment-psychology', question: 'What does "Buy the rumor, sell the news" mean?', options: ['You should buy before news is released and sell when bad news hits', 'Markets often price in anticipated events early; when the news arrives it triggers selling', 'You should only buy stocks based on rumors', 'News articles are never accurate for trading'], correct_answer: 1, explanation: 'Markets anticipate and price in expected events. When the event actually happens, traders who bought the rumor sell — causing prices to fall even on good news.', difficulty: 'hard', order_index: 1 },
  { module_slug: 'market-sentiment-psychology', question: 'What is "FOMO" in a trading context?', options: ['A type of technical chart pattern', 'Fear of Missing Out — buying at peaks because everyone around you seems to profit', 'A fundamental valuation method', 'A regulatory requirement in Indian markets'], correct_answer: 1, explanation: 'FOMO drives impulsive buying at market tops when excitement is highest — exactly the worst time to buy.', difficulty: 'medium', order_index: 2 },
  // Chapter 11 — Market Events
  { module_slug: 'market-events-crisis', question: 'Why do markets typically recover quickly after most geopolitical crises?', options: ['Governments ban all selling during crises', 'Uncertainty resolves as the situation becomes clearer — and initial panic overestimates long-term damage', 'FIIs always buy aggressively during wars', 'Stock prices never actually fall during crises'], correct_answer: 1, explanation: 'Markets initially overshoot on fear. As clarity improves, rational pricing returns and recovery often surprises most participants.', difficulty: 'hard', order_index: 1 },
  { module_slug: 'market-events-crisis', question: 'When RBI raises interest rates, which sector is typically most hurt?', options: ['FMCG — consumer staples are rate-insensitive', 'IT — technology companies benefit from higher rates', 'Companies with high debt and leveraged sectors like real estate', 'Gold mining companies'], correct_answer: 2, explanation: 'Rate hikes raise borrowing costs. Companies with high debt face higher interest burdens; real estate and infrastructure are especially vulnerable.', difficulty: 'medium', order_index: 2 },
  // Chapter 12 — Risk Management  
  { module_slug: 'risk-money-management', question: 'If your capital is ₹2,00,000 and you follow the 1% risk rule, what is your maximum loss on a single trade?', options: ['₹200', '₹2,000', '₹20,000', '₹1,00,000'], correct_answer: 1, explanation: '1% of ₹2,00,000 = ₹2,000. This limits any single trade loss to a manageable amount of total capital.', difficulty: 'easy', order_index: 1 },
  { module_slug: 'risk-money-management', question: 'What is "revenge trading"?', options: ['Trading against a stock you dislike', 'Immediately entering a new trade after a loss to win back the money — a dangerous emotional impulse', 'A legal strategy of shorting overvalued stocks', 'Trading the same stock every day consistently'], correct_answer: 1, explanation: 'Revenge trading is an emotional reaction to losses. It leads to poorly planned trades in unfavorable conditions — often making losses far worse.', difficulty: 'medium', order_index: 2 },
  // Chapter 13 — Backtesting
  { module_slug: 'backtesting', question: 'What is "overfitting" in backtesting?', options: ['Running too many backtests on the same strategy', 'Tuning a strategy to perfectly fit past data — it then fails on new data', 'Having a win rate that is too low', 'Using too long a historical data period'], correct_answer: 1, explanation: 'Overfitting creates strategies that match historical noise, not real patterns. They perform perfectly in the past but fail in live trading.', difficulty: 'hard', order_index: 1 },
  { module_slug: 'backtesting', question: 'What does "expectancy" measure in a backtest?', options: ['The probability that a trade will be profitable', 'The expected profit per unit of risk over many trades — (Win% × Avg Win) - (Loss% × Avg Loss)', 'The maximum drawdown of the strategy', 'The number of trades taken per month'], correct_answer: 1, explanation: 'Expectancy is the most important backtest metric. A positive expectancy means the strategy has a mathematical edge over many trades.', difficulty: 'hard', order_index: 2 },
  // Chapter 14 — Paper Trading
  { module_slug: 'paper-trading', question: 'Why should beginners paper trade before using real money?', options: ['Paper trading guarantees profits that transfer to real trading', 'It lets you practice, discover strategy flaws, and build discipline without financial risk', 'Regulators require paper trading before real accounts', 'Paper trading is faster than real trading'], correct_answer: 1, explanation: 'Paper trading builds skill and reveals weaknesses in your approach without any financial consequences.', difficulty: 'easy', order_index: 1 },
  { module_slug: 'paper-trading', question: 'To get full value from paper trading, you should:', options: ['Take larger positions than you would with real money to test extremes', 'Treat it exactly like real trading with the same rules, size, and discipline', 'Paper trade only on days when you expect markets to rise', 'Ignore stop losses since there is no real money risk'], correct_answer: 1, explanation: 'Paper trading without discipline produces false confidence. The lessons only transfer if you simulate real conditions faithfully.', difficulty: 'medium', order_index: 2 },
  // Chapter 15 — Research
  { module_slug: 'research-platform', question: 'Which filter would best help identify stocks in an uptrend?', options: ['P/E below 10', 'Price above the 200-day EMA', 'RSI above 80', 'High debt-to-equity ratio'], correct_answer: 1, explanation: 'Price above the 200-day EMA is a widely used signal that the stock is in a longer-term uptrend.', difficulty: 'medium', order_index: 1 },
  { module_slug: 'research-platform', question: 'What is the purpose of building a watchlist?', options: ['To automatically buy stocks when they reach a price', 'To track researched stocks you are monitoring — before committing to a trade', 'To compare all stocks in the NIFTY 50 simultaneously', 'To receive dividend notifications'], correct_answer: 1, explanation: 'A watchlist holds your researched candidates so you can monitor their price action and wait for the right setup before acting.', difficulty: 'easy', order_index: 2 },
];

async function seed() {
  console.log('🌱 Seeding 15 learning modules from CONTENTS.MD...\n');

  let moduleCount = 0;
  for (const mod of modules) {
    const { error } = await supabase
      .from('learning_modules')
      .upsert({
        slug: mod.slug,
        title: mod.title,
        description: mod.description,
        content: mod.content,
        order_index: mod.order_index,
        is_premium: mod.is_premium,
      }, { onConflict: 'slug' });

    if (error) {
      console.error(`❌ Failed to seed module: ${mod.title}`, error.message);
    } else {
      console.log(`✅ Module ${mod.order_index}: ${mod.title}`);
      moduleCount++;
    }
  }

  console.log(`\n📝 Seeding ${quizQuestions.length} quiz questions...\n`);

  let questionCount = 0;
  for (const q of quizQuestions) {
    const { error } = await supabase
      .from('quiz_questions')
      .upsert({
        module_slug: q.module_slug,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        order_index: q.order_index,
      }, { onConflict: 'id' });

    if (error) {
      console.error(`❌ Failed question: "${q.question.slice(0, 40)}..."`, error.message);
    } else {
      questionCount++;
    }
  }

  console.log(`\n🎓 Done! Seeded ${moduleCount}/15 modules and ${questionCount} quiz questions.`);
}

seed().catch(console.error);
