-- CreateTable
CREATE TABLE "Blogpost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "coverImage" TEXT,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "authorName" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Blogpost_pkey" PRIMARY KEY ("id")
);
