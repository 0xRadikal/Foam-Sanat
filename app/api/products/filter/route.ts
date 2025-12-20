import { NextRequest, NextResponse } from 'next/server';
import { filterProducts, filterSchema } from './helpers';

export async function POST(request: NextRequest) {
  try {
    const parsed = filterSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const result = await filterProducts(parsed.data);

    return NextResponse.json(result);
  } catch (error) {
    if ((error as Error).message === 'INVALID_FILTER') {
      return NextResponse.json({ error: 'Invalid filter payload.' }, { status: 400 });
    }
    if ((error as Error).message === 'UNKNOWN_ABILITY') {
      return NextResponse.json({ error: 'Unknown or non-filterable ability requested.' }, { status: 400 });
    }
    console.error('product.filter.failed', error);
    return NextResponse.json({ error: 'Unable to filter products.' }, { status: 500 });
  }
}

