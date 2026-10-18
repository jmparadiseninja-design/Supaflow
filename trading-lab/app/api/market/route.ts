import { NextRequest, NextResponse } from 'next/server';

const symbolMap: Record<string, string> = {
  'NASDAQ:AAPL': 'AAPL',
  'BINANCE:BTCUSDT': 'BTC-USD',
  'BINANCE:ETHUSDT': 'ETH-USD',
  'FX:EURUSD': 'EURUSD=X',
};

function formatPrice(value: number, symbol: string) {
  if (!Number.isFinite(value)) return '--';
  if (symbol === 'AAPL' || symbol === 'BTC-USD' || symbol === 'ETH-USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: symbol === 'AAPL' ? 2 : 0,
    }).format(value);
  }
  return value.toFixed(4);
}

function trendLabel(changePct: number) {
  if (changePct > 1) return 'Bullish';
  if (changePct < -1) return 'Bearish';
  if (changePct > 0) return 'Mild Up';
  if (changePct < 0) return 'Mild Down';
  return 'Flat';
}

function volatilityLabel(series: number[]) {
  const returns = series.slice(1).map((value, index) => (value - series[index]) / series[index]);
  if (!returns.length) return 'Unknown';
  const avg = returns.reduce((sum, value) => sum + value, 0) / returns.length;
  const variance = returns.reduce((sum, value) => sum + (value - avg) ** 2, 0) / returns.length;
  const dailyVolatility = Math.sqrt(variance);
  if (dailyVolatility > 0.03) return 'High';
  if (dailyVolatility > 0.015) return 'Medium';
  return 'Low';
}

export async function GET(request: NextRequest) {
  try {
    const symbol = request.nextUrl.searchParams.get('symbol') ?? 'NASDAQ:AAPL';
    const yahooSymbol = symbolMap[symbol];
    if (!yahooSymbol) {
      return NextResponse.json({ error: 'Unsupported market symbol' }, { status: 400 });
    }
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1mo&includeAdjustedClose=true`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'application/json',
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance request failed with status ${response.status}`);
    }

    const data = await response.json();
    const result = data?.chart?.result?.[0];

    if (!result) {
      throw new Error('No chart data returned');
    }

    const quote = result.indicators?.quote?.[0] ?? {};
    const closes: number[] = (quote.close ?? []).filter(
      (value: number | null): value is number => typeof value === 'number' && Number.isFinite(value),
    );
    if (!closes.length) {
      throw new Error('Market data response did not contain valid prices');
    }
    const latestClose = closes.at(-1) ?? result.meta?.regularMarketPrice ?? 0;
    const prevClose = result.meta?.previousClose ?? closes.at(-2) ?? latestClose;
    const changePct = prevClose ? ((latestClose - prevClose) / prevClose) * 100 : 0;
    const price = formatPrice(Number(latestClose), yahooSymbol);
    const session = `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%`;

    return NextResponse.json({
      symbol,
      summary: {
        price,
        session,
        trend: trendLabel(changePct),
        volatility: volatilityLabel(closes.slice(-20)),
        prices: closes.slice(-30),
      },
    });
  } catch (error) {
    console.error('Market API error:', error);
    return NextResponse.json(
      { error: 'Market data is temporarily unavailable. Please try again later.' },
      { status: 502 },
    );
  }
}
