import {NextResponse} from 'next/server';
import {strategies} from '@/lib/strategies';
export async function GET(){return NextResponse.json({strategies})}
