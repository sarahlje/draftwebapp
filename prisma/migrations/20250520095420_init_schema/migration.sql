-- CreateEnum
CREATE TYPE "Goal" AS ENUM ('strength', 'cardio', 'general_fitness');

-- CreateEnum
CREATE TYPE "Experience" AS ENUM ('beginner', 'intermediate', 'advanced');

-- CreateEnum
CREATE TYPE "Focus" AS ENUM ('chest', 'back', 'legs', 'glutes', 'arms', 'shoulders', 'core', 'full_body');

-- CreateEnum
CREATE TYPE "Equipment" AS ENUM ('bodyweight', 'treadmill', 'dumbbells', 'kettlebells', 'barbell', 'bench', 'cable_machines', 'any');

-- CreateTable
CREATE TABLE "Exercise" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "muscleGroup" TEXT NOT NULL,
    "equipment" TEXT,
    "difficulty" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "instructions" TEXT,
    "imageUrl" TEXT,
    "isCompound" BOOLEAN NOT NULL DEFAULT false,
    "estimatedTimeInMinutes" INTEGER NOT NULL DEFAULT 3,
    "tips" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workout" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "goal" "Goal" NOT NULL,
    "focus" "Focus"[],
    "experience" "Experience" NOT NULL,
    "equipment" "Equipment"[],
    "exercises" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Workout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_name_key" ON "Exercise"("name");
