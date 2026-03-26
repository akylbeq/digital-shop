import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.formData();

  const invId = formData.get('InvId')?.toString() ?? '';

  return NextResponse.redirect(
    new URL(`/payment/fail/view?orderId=${invId}`, request.url),
  );
}