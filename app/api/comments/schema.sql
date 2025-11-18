CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  productId TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  author TEXT NOT NULL,
  email TEXT NOT NULL,
  text TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending', 'approved', 'rejected')),
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS comment_replies (
  id TEXT PRIMARY KEY,
  commentId TEXT NOT NULL,
  author TEXT NOT NULL,
  text TEXT NOT NULL,
  isAdmin INTEGER DEFAULT 0,
  status TEXT NOT NULL CHECK(status IN ('pending', 'approved', 'rejected')),
  createdAt TEXT NOT NULL,
  FOREIGN KEY (commentId) REFERENCES comments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_status ON comments (productId, status);
CREATE INDEX IF NOT EXISTS idx_replies_comment ON comment_replies (commentId);
