-- AlterTable
ALTER TABLE "HuiGroup" ADD COLUMN     "createTxHash" TEXT,
ADD COLUMN     "creatorUserId" TEXT;

-- AlterTable
ALTER TABLE "HuiMember" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "RoundDefault" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "txHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoundDefault_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoundDefault_roundId_userId_key" ON "RoundDefault"("roundId", "userId");

-- AddForeignKey
ALTER TABLE "RoundDefault" ADD CONSTRAINT "RoundDefault_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundDefault" ADD CONSTRAINT "RoundDefault_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
