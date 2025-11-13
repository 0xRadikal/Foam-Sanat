import { NextRequest, NextResponse } from 'next/server';
import { createStoredComment, readComments, sanitizeComment, writeComments } from './lib/store';
import { checkRateLimitOrSpam, validateCommentPayload } from './lib/validation';
import type { CommentPayload } from './lib/validation';

export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get('productId');
  if (!productId) {
    return NextResponse.json({ error: 'productId query parameter is required.' }, { status: 400 });
  }

  const comments = await readComments();
  const filtered = comments
    .filter((comment) => comment.productId === productId && comment.status === 'approved')
    .map(sanitizeComment);

  return NextResponse.json({ comments: filtered });
}

export async function POST(request: NextRequest) {
  let payload: CommentPayload;
  try {
    payload = (await request.json()) as CommentPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const validationError = validateCommentPayload(payload);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const spamError = checkRateLimitOrSpam(request, String(payload.text));
  if (spamError) {
    return NextResponse.json({ error: spamError }, { status: 429 });
  }

  const comments = await readComments();
  const duplicate = comments.find(
    (comment) =>
      comment.productId === payload.productId &&
      comment.email.toLowerCase() === String(payload.email).toLowerCase() &&
      comment.text.trim() === String(payload.text).trim()
  );

  if (duplicate) {
    return NextResponse.json(
      { error: 'This comment has already been submitted and is awaiting moderation.' },
      { status: 409 }
    );
  }

  const newComment = createStoredComment({
    productId: String(payload.productId),
    rating: Number(payload.rating),
    author: String(payload.author).trim(),
    email: String(payload.email).trim().toLowerCase(),
    text: String(payload.text).trim(),
    status: 'pending'
  });

  comments.push(newComment);
  await writeComments(comments);

  return NextResponse.json({ comment: sanitizeComment(newComment) }, { status: 201 });
}
