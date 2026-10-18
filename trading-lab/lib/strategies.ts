import {Strategy} from './market';
export const strategies:Strategy[]=[
{id:'momentum-1',name:'EMA Momentum',description:'Fast/slow trend crossover with RSI filter.',fast:9,slow:21,rsi:14,stop:.02,target:.04},
{id:'balanced-1',name:'Balanced Trend',description:'Slower crossover designed to reduce noise.',fast:12,slow:30,rsi:14,stop:.025,target:.05},
{id:'swing-1',name:'Swing Momentum',description:'Longer trend confirmation with wider exits.',fast:20,slow:50,rsi:14,stop:.035,target:.07},
{id:'fast-1',name:'Fast Breakout Proxy',description:'Short moving-average crossover for experimentation.',fast:5,slow:15,rsi:10,stop:.015,target:.03}
];
export function rankStrategy(x:any){return Math.max(0,Math.min(100,50+x.returnPct*2+x.winRate*.2-x.maxDrawdown*1.5))}
