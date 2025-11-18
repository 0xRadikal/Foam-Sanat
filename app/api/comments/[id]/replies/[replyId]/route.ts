import { NextRequest, NextResponse } from 'next/server';
import { assertAdmin } from '../../../lib/auth';
import { deleteStoredReply } from '../../../lib/store';

export async function DELETE(request: NextRequest, { params }: { params: { id: string; replyId: string } }) {
  if (!assertAdmin(request)) {
    return NextResponse.json({ error: 'Admin authorization required.' }, { status: 401 });
  }

  const deleted = deleteStoredReply(params.id, params.replyId);
  if (!deleted) {
    return NextResponse.json({ error: 'Reply not found.' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
