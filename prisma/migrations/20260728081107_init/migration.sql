-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "HuiGroupStatus" AS ENUM ('OPEN', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "displayName" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KycRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "mockDocType" TEXT,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "KycRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditScore" (
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 500,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditScore_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "CreditScoreEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditScoreEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HuiGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contractAddress" TEXT,
    "shareAmountWei" TEXT NOT NULL,
    "totalMembers" INTEGER NOT NULL,
    "collateralWei" TEXT NOT NULL,
    "roundDurationSec" INTEGER NOT NULL,
    "bidDurationSec" INTEGER NOT NULL,
    "status" "HuiGroupStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HuiGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HuiMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hasWon" BOOLEAN NOT NULL DEFAULT false,
    "wonRound" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "joinTxHash" TEXT,

    CONSTRAINT "HuiMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Round" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "winnerUserId" TEXT,
    "winningBidWei" TEXT,
    "requiredFromSurvivorWei" TEXT,
    "requiredFromDeadWei" TEXT,
    "bidClosed" BOOLEAN NOT NULL DEFAULT false,
    "settled" BOOLEAN NOT NULL DEFAULT false,
    "closeRoundTxHash" TEXT,
    "payoutTxHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bid" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountWei" TEXT NOT NULL,
    "txHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contribution" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountWei" TEXT NOT NULL,
    "txHash" TEXT,
    "onTime" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "KycRecord_userId_key" ON "KycRecord"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HuiMember_groupId_userId_key" ON "HuiMember"("groupId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Round_groupId_roundNumber_key" ON "Round"("groupId", "roundNumber");

-- AddForeignKey
ALTER TABLE "KycRecord" ADD CONSTRAINT "KycRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditScore" ADD CONSTRAINT "CreditScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditScoreEvent" ADD CONSTRAINT "CreditScoreEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HuiMember" ADD CONSTRAINT "HuiMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "HuiGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HuiMember" ADD CONSTRAINT "HuiMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "HuiGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_winnerUserId_fkey" FOREIGN KEY ("winnerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
