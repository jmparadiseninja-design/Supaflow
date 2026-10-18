import {NextResponse} from 'next/server';
import {generateMarket,backtest} from '@/lib/market';
import {strategies,rankStrategy} from '@/lib/strategies';
export async function POST(){const candles=generateMarket();const results=strategies.map(s=>({...s,...backtest(candles,s)})).map(x=>({...x,score:rankStrategy(x)})).sort((a,b)=>b.score-a.score);return NextResponse.json({candles,results})}
