'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  Activity,
  BrainCircuit,
  ChartNoAxesCombined,
  LogOut,
  Play,
  ShieldCheck,
  Sparkles,
  UserRound,
  WalletCards,
} from 'lucide-react';

type Result = {
  id: string;
  name: string;
  description: string;
  returnPct: number;
  trades: number;
  winRate: number;
  maxDrawdown: number;
  score: number;
  final: number;
};

type MarketOption = { label: string; value: string; tradingViewUrl: string };
type MarketSummary = {
  price: string;
  session: string;
  trend: string;
  volatility: string;
  prices: number[];
};
type DemoProfile = { displayName: string };

const marketOptions: MarketOption[] = [
  {
    label: 'AAPL',
    value: 'NASDAQ:AAPL',
    tradingViewUrl: 'https://www.tradingview.com/chart/?symbol=NASDAQ%3AAAPL',
  },
  {
    label: 'BTC/USD',
    value: 'BINANCE:BTCUSDT',
    tradingViewUrl: 'https://www.tradingview.com/chart/?symbol=BINANCE%3ABTCUSDT',
  },
  {
    label: 'ETH/USD',
    value: 'BINANCE:ETHUSDT',
    tradingViewUrl: 'https://www.tradingview.com/chart/?symbol=BINANCE%3AETHUSDT',
  },
  {
    label: 'EUR/USD',
    value: 'FX:EURUSD',
    tradingViewUrl: 'https://www.tradingview.com/chart/?symbol=FX%3AEURUSD',
  },
];

const defaultMarketSummary: MarketSummary = {
  price: '--',
  session: '--',
  trend: '--',
  volatility: '--',
  prices: [],
};

const demoProfileKey = 'supaflow-demo-profile';

export default function Home() {
  const [results, setResults] = useState<Result[]>([]);
  const [running, setRunning] = useState(false);
  const [selected, setSelected] = useState<Result | null>(null);
  const [status, setStatus] = useState('Ready — no API key required');
  const [marketSymbol, setMarketSymbol] = useState(marketOptions[0].value);
  const [marketSummary, setMarketSummary] = useState(defaultMarketSummary);
  const [marketLoading, setMarketLoading] = useState(true);
  const [marketError, setMarketError] = useState('');
  const [profile, setProfile] = useState<DemoProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [accountError, setAccountError] = useState('');
  const selectedMarket =
    marketOptions.find((option) => option.value === marketSymbol) ?? marketOptions[0];

  async function run() {
    setRunning(true);
    setStatus('Generating market data → testing strategies → ranking results…');
    try {
      const response = await fetch('/api/backtest', { method: 'POST' });
      if (!response.ok) {
        throw new Error(`Backtest request failed (${response.status})`);
      }
      const data: { results?: Result[] } = await response.json();
      if (!data.results?.length) {
        throw new Error('The backtest returned no strategy results.');
      }
      setResults(data.results);
      setSelected(data.results[0]);
      setStatus('Backtest complete — paper trading only');
    } catch (error) {
      console.error('Backtest request error:', error);
      setStatus('Research could not run. Please try again.');
    } finally {
      setRunning(false);
    }
  }

  function createDemoProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = displayName.trim();
    if (!name) {
      setAccountError('Enter a display name to start your local practice profile.');
      return;
    }

    const nextProfile = { displayName: name.slice(0, 40) };
    localStorage.setItem(demoProfileKey, JSON.stringify(nextProfile));
    setProfile(nextProfile);
    setDisplayName('');
    setAccountError('');
  }

  function signOutDemoProfile() {
    localStorage.removeItem(demoProfileKey);
    setProfile(null);
  }

  useEffect(() => {
    const storedProfile = localStorage.getItem(demoProfileKey);
    if (!storedProfile) return;
    try {
      const parsed: unknown = JSON.parse(storedProfile);
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        'displayName' in parsed &&
        typeof parsed.displayName === 'string'
      ) {
        setProfile({ displayName: parsed.displayName.slice(0, 40) });
      }
    } catch (error) {
      console.error('Could not read the saved local demo profile:', error);
      localStorage.removeItem(demoProfileKey);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadMarket() {
      setMarketLoading(true);
      setMarketError('');
      try {
        const response = await fetch(
          `/api/market?symbol=${encodeURIComponent(marketSymbol)}`,
        );
        const data: { summary?: MarketSummary; error?: string } = await response.json();
        if (!response.ok || !data.summary) {
          throw new Error(data.error ?? `Market data request failed (${response.status})`);
        }
        if (active) setMarketSummary(data.summary);
      } catch (error) {
        console.error('Market summary request error:', error);
        if (active) {
          setMarketSummary(defaultMarketSummary);
          setMarketError('Market data is unavailable right now.');
        }
      } finally {
        if (active) setMarketLoading(false);
      }
    }

    void loadMarket();
    return () => {
      active = false;
    };
  }, [marketSymbol]);

  useEffect(() => {
    void run();
  }, []);

  return (
    <main className="min-h-screen p-5 md:p-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="blue" /> SUPAFLOW <span className="muted">AI TRADING LAB</span>
          </div>
          <p className="muted mt-1">Free strategy research + local backtesting • V1</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="panel px-3 py-2">
            <label
              htmlFor="market-symbol"
              className="block text-[10px] uppercase tracking-[0.14em] muted mb-1"
            >
              Market
            </label>
            <select
              id="market-symbol"
              value={marketSymbol}
              onChange={(event) => setMarketSymbol(event.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-sm outline-none focus:border-sky-500"
            >
              {marketOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={run}
            disabled={running}
            className="panel px-4 py-3 flex items-center gap-2 hover:border-slate-500 disabled:opacity-50"
          >
            <Play size={17} />
            {running ? 'Running…' : 'Run new research'}
          </button>
        </div>
      </header>

      <section className="panel p-4 mb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <UserRound size={17} className="text-sky-300" />
              {profile ? `Practice profile: ${profile.displayName}` : 'Local practice profile'}
            </div>
            <p className="muted text-xs mt-1">
              This demo profile is saved only in this browser. It is not a secure account or
              Facebook sign-in.
            </p>
          </div>
          {profile ? (
            <button
              onClick={signOutDemoProfile}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm hover:border-slate-500"
            >
              <LogOut size={15} /> Sign out
            </button>
          ) : (
            <form onSubmit={createDemoProfile} className="flex flex-wrap gap-2">
              <label className="sr-only" htmlFor="demo-display-name">
                Display name
              </label>
              <input
                id="demo-display-name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                maxLength={40}
                placeholder="Choose a display name"
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                className="rounded-lg border border-sky-500/60 bg-sky-500/10 px-3 py-2 text-sm font-medium text-sky-200 hover:border-sky-400"
              >
                Start practicing
              </button>
              {accountError && (
                <span role="alert" className="w-full text-xs text-rose-300">
                  {accountError}
                </span>
              )}
            </form>
          )}
        </div>
      </section>

      <div className="panel p-4 mb-5 flex items-center gap-3">
        <Activity size={18} className="green" />
        <span>{status}</span>
        <span className="ml-auto text-xs muted">$10,000 paper portfolio</span>
      </div>

      <section className="grid md:grid-cols-4 gap-4 mb-5">
        <Stat icon={<BrainCircuit />} title="AI Research" value="READY" note="Free/local V1" />
        <Stat
          icon={<ChartNoAxesCombined />}
          title="Strategies"
          value={String(results.length || 4)}
          note="tested automatically"
        />
        <Stat icon={<ShieldCheck />} title="Execution" value="PAPER" note="no real trades" />
        <Stat icon={<WalletCards />} title="Cost" value="$0" note="for this V1" />
      </section>

      <section className="panel p-4 mb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] muted">Market overview</div>
            <h2 className="text-2xl font-bold mt-2">{selectedMarket.label}</h2>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="muted">Last</span>
            <span className="font-semibold text-lg">{marketSummary.price}</span>
            <span
              className={
                marketSummary.session.startsWith('-') ? 'text-rose-400' : 'text-emerald-400'
              }
            >
              {marketSummary.session}
            </span>
          </div>
        </div>
        <div className="grid md:grid-cols-[1fr_2fr] gap-4 mt-4">
          <div className="grid sm:grid-cols-3 md:grid-cols-1 gap-3">
            <MiniStat label="Trend" value={marketSummary.trend} />
            <MiniStat label="Volatility" value={marketSummary.volatility} />
            <MiniStat label="Session" value={marketSummary.session} />
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 min-h-36">
            <div className="flex justify-between items-center">
              <div className="text-[10px] uppercase tracking-[0.14em] muted">
                Recent daily prices
              </div>
              <div className="text-[10px] muted">
                {marketLoading ? 'Loading…' : 'Public market data'}
              </div>
            </div>
            {marketError ? (
              <p role="status" className="text-sm text-rose-300 mt-8 text-center">
                {marketError}
              </p>
            ) : (
              <Sparkline prices={marketSummary.prices} label={selectedMarket.label} />
            )}
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5">
        <section className="panel p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-semibold text-lg">Strategy Discovery</h2>
              <p className="muted text-sm">Candidate strategies ranked by backtest score.</p>
            </div>
            <div className="text-xs muted">{selectedMarket.label}</div>
          </div>
          <div className="space-y-3">
            {results.map((result, index) => (
              <article
                key={result.id}
                className={`w-full text-left p-4 rounded-xl border ${
                  selected?.id === result.id
                    ? 'border-blue-400 bg-slate-900'
                    : 'border-slate-800 bg-slate-950'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelected(result)}
                  aria-pressed={selected?.id === result.id}
                  className="w-full text-left hover:opacity-90"
                >
                  <div className="flex justify-between gap-4">
                    <div>
                      <div className="font-medium">
                        #{index + 1} {result.name}
                      </div>
                      <div className="muted text-sm mt-1">{result.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{result.score.toFixed(1)}</div>
                      <div className="muted text-xs">AI score</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-4 text-sm">
                    <Metric
                      label="Return"
                      value={`${result.returnPct.toFixed(2)}%`}
                      good={result.returnPct >= 0}
                    />
                    <Metric
                      label="Win rate"
                      value={`${result.winRate.toFixed(1)}%`}
                      good={result.winRate >= 50}
                    />
                    <Metric
                      label="Drawdown"
                      value={`${result.maxDrawdown.toFixed(2)}%`}
                      good={result.maxDrawdown < 15}
                    />
                  </div>
                </button>
                <div className="mt-4 flex justify-end">
                  <a
                    href={selectedMarket.tradingViewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-lg border border-sky-500/60 bg-sky-500/10 px-2.5 py-1.5 text-xs font-medium text-sky-200 hover:border-sky-400 hover:bg-sky-500/20"
                  >
                    View chart
                  </a>
                </div>
              </article>
            ))}
            {!results.length && !running && (
              <p role="status" className="muted text-sm">
                No strategy results yet. Use “Run new research” to try again.
              </p>
            )}
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="font-semibold text-lg">Research Agent</h2>
          <p className="muted text-sm mt-1">
            This is the place where we will plug in a free AI model later.
          </p>
          <div className="mt-5 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-xs muted">CURRENT PIPELINE</div>
            <div className="mt-3 space-y-3 text-sm">
              <Step n="01" text="Generate market scenario" />
              <Step n="02" text="Generate candidate strategies" />
              <Step n="03" text="Backtest each candidate" />
              <Step n="04" text="Rank risk vs return" />
              <Step n="05" text="Send best idea to paper trading" />
            </div>
          </div>
          {selected && (
            <div className="mt-5">
              <div className="text-xs muted">SELECTED STRATEGY</div>
              <h3 className="text-xl font-semibold mt-1">{selected.name}</h3>
              <p className="muted text-sm mt-1">{selected.description}</p>
              <div className="mt-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="muted">Backtest trades</span>
                  <span>{selected.trades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="muted">Ending paper balance</span>
                  <span>${selected.final.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="muted">Max drawdown</span>
                  <span>{selected.maxDrawdown.toFixed(2)}%</span>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.14em] muted">Market</div>
                  <div className="font-medium mt-1">{selectedMarket.label}</div>
                </div>
                <a
                  href={selectedMarket.tradingViewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg border border-sky-500/60 bg-sky-500/10 px-3 py-2 text-sm font-medium text-sky-200 hover:border-sky-400 hover:bg-sky-500/20"
                >
                  Check on TradingView
                </a>
              </div>
            </div>
          )}
          <div className="mt-6 p-3 rounded-lg border border-amber-800/50 bg-amber-950/20 text-xs text-amber-200">
            Educational research only. Backtests can fail in live markets. V1 never sends real
            orders.
          </div>
        </section>
      </div>
      <footer className="mt-8 border-t border-slate-800 pt-4 text-xs muted">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>Research and paper trading only. No investment advice or real orders.</span>
          <a href="/legal" className="text-sky-300 hover:text-sky-200 underline underline-offset-4">
            Terms, privacy &amp; license
          </a>
        </div>
      </footer>
    </main>
  );
}

function Sparkline({ prices, label }: { prices: number[]; label: string }) {
  if (prices.length < 2) {
    return (
      <p className="muted text-sm mt-8 text-center">
        No recent price history available for this market.
      </p>
    );
  }

  const min = Math.min(...prices);
  const range = Math.max(...prices) - min || 1;
  const points = prices
    .map((price, index) => {
      const x = (index / (prices.length - 1)) * 296 + 2;
      const y = 68 - ((price - min) / range) * 60;
      return `${x},${y}`;
    })
    .join(' ');
  const isUp = prices.at(-1)! >= prices[0];

  return (
    <svg
      viewBox="0 0 300 76"
      role="img"
      aria-label={`${label} recent daily closing prices`}
      className="w-full h-24 mt-2 overflow-visible"
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke={isUp ? '#34d399' : '#fb7185'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Stat({
  icon,
  title,
  value,
  note,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  note: string;
}) {
  return (
    <div className="panel p-4">
      <div className="flex items-center gap-2 muted text-sm">
        {icon}
        {title}
      </div>
      <div className="text-2xl font-bold mt-2">{value}</div>
      <div className="muted text-xs mt-1">{note}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
      <div className="text-[10px] uppercase tracking-[0.14em] muted">{label}</div>
      <div className="font-semibold text-base mt-2">{value}</div>
    </div>
  );
}

function Metric({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div>
      <div className="muted text-xs">{label}</div>
      <div className={good ? 'green' : 'red'}>{value}</div>
    </div>
  );
}

function Step({ n, text }: { n: string; text: string }) {
  return (
    <div className="flex gap-3 items-center">
      <span className="text-xs muted w-6">{n}</span>
      <span>{text}</span>
    </div>
  );
}
