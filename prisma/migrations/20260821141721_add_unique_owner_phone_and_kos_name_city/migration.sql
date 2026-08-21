/*
  Warnings:

  - A unique constraint covering the columns `[name,city]` on the table `kos` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `owners` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "kos_name_city_key" ON "kos"("name", "city");

-- CreateIndex
CREATE UNIQUE INDEX "owners_phone_key" ON "owners"("phone");
