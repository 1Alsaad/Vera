import { NextResponse } from 'next/server';
import { createTarget } from '../../../actions/target-actions';

export async function POST(request: Request) {
  const formData = await request.formData();
  const result = await createTarget({} as any, formData);
  return NextResponse.json(result);
}