-- AlterTable
ALTER TABLE "Todo" ADD COLUMN "dueDate" DATETIME;
ALTER TABLE "Todo" ADD COLUMN "imageUrl" TEXT;

-- CreateTable
CREATE TABLE "TodoRelationship" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dependentId" INTEGER NOT NULL,
    "dependencyId" INTEGER NOT NULL,
    CONSTRAINT "TodoRelationship_dependentId_fkey" FOREIGN KEY ("dependentId") REFERENCES "Todo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TodoRelationship_dependencyId_fkey" FOREIGN KEY ("dependencyId") REFERENCES "Todo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TodoRelationship_dependentId_dependencyId_key" ON "TodoRelationship"("dependentId", "dependencyId");
