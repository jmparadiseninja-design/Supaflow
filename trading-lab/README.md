# Supaflow AI Trading Lab — V1

A $0 local-first trading research lab. It generates a synthetic market scenario, tests multiple technical strategies, ranks them, and displays results. No broker connection and no real trades.

## Run in VS Code

1. Install Node.js LTS.
2. Open this folder in VS Code.
3. Open Terminal.
4. Run:

```bash
npm install
npm run dev
```

5. Open http://localhost:3000

## V1 design

- Next.js + TypeScript
- Local strategy engine
- Local backtesting
- No database
- No paid API
- No secret keys in browser
- Paper-trading/research only
- Local demo profile only; no real account system yet
- Public market data and external chart links
- TradingView Pine Script strategy: [tradingview/supaflow_momentum.pine](./tradingview/supaflow_momentum.pine)

## Use the strategy in TradingView

1. Open a chart for the symbol and timeframe you want to test.
2. Open **Pine Editor**, paste in `tradingview/supaflow_momentum.pine`, and select **Add to chart**.
3. Review the results in **Strategy Tester**. Adjust parameters in the script settings as needed.
4. To keep it in your account, save it as a private script. Publishing publicly is optional and makes the script visible according to TradingView's publishing rules.

The script is a long-only SMA/RSI strategy with default 9/21 SMA lengths, a 14-period RSI entry filter, a 2% close-based stop, and a 4% close-based target. It is for educational backtesting only. TradingView executes on real chart data and its fills, fees, slippage, and results will differ from this app's synthetic-data backtests. It does not place live orders.

## Legal and public release

- Original project code is proprietary; see [LICENSE](./LICENSE).
- The [Terms, Privacy & License page](./app/legal/page.tsx) is a draft and should receive legal review before public launch.
- Review the draft with a qualified lawyer and update it to match the hosting provider, data flows, and laws where the service is offered.
- The local demo profile is not authentication and should not be used for sensitive or personal information.
- Market summaries use a public third-party market-data endpoint; availability, accuracy, delay, and provider terms may vary.

## Next upgrades

1. Add real historical market data through a free/public source.
2. Add a free-tier AI provider through a server-side API route.
3. Add strategy prompt generation.
4. Add walk-forward/out-of-sample testing.
5. Add paper portfolio and trade journal.
6. Only after extensive testing, consider broker integration.

Never put an API key in client-side code or GitHub.
