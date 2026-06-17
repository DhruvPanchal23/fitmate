import { PrismaClient } from '../src/generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo data starting...');

  // 1. Clean up existing demo data if present
  const demoEmail = 'demo@fitmate.com';
  const existingUser = await prisma.user.findUnique({ where: { email: demoEmail } });
  
  if (existingUser) {
    console.log('Deleting existing demo data for user...');
    await prisma.mealItem.deleteMany({ where: { meal: { userId: existingUser.id } } });
    await prisma.mealPlanMeal.deleteMany({ where: { mealPlanDay: { mealPlan: { userId: existingUser.id } } } });
    await prisma.mealPlanDay.deleteMany({ where: { mealPlan: { userId: existingUser.id } } });
    await prisma.mealPlan.deleteMany({ where: { userId: existingUser.id } });
    await prisma.userProfile.deleteMany({ where: { userId: existingUser.id } });
    await prisma.meal.deleteMany({ where: { userId: existingUser.id } });
    await prisma.waterLog.deleteMany({ where: { userId: existingUser.id } });
    await prisma.supplementLog.deleteMany({ where: { userId: existingUser.id } });
    await prisma.exerciseLog.deleteMany({ where: { userId: existingUser.id } });
    await prisma.conversationMessage.deleteMany({ where: { conversation: { userId: existingUser.id } } });
    await prisma.conversation.deleteMany({ where: { userId: existingUser.id } });
    await prisma.compensationPlan.deleteMany({ where: { userId: existingUser.id } });
    await prisma.travelDailySummary.deleteMany({ where: { travelSession: { userId: existingUser.id } } });
    await prisma.travelSession.deleteMany({ where: { userId: existingUser.id } });
    await prisma.notificationHistory.deleteMany({ where: { notification: { userId: existingUser.id } } });
    await prisma.notification.deleteMany({ where: { userId: existingUser.id } });
    await prisma.goalHistory.deleteMany({ where: { userId: existingUser.id } });
    await prisma.user.delete({ where: { email: demoEmail } });
  }

  // 2. Create Demo User
  const hashedPassword = await bcrypt.hash('fitmate-demo-password-2026', 10);
  const user = await prisma.user.create({
    data: {
      email: demoEmail,
      passwordHash: hashedPassword,
    },
  });
  console.log(`Created user: ${user.email} (ID: ${user.id})`);

  // 3. Create User Profile
  const profile = await prisma.userProfile.create({
    data: {
      userId: user.id,
      fullName: 'Dhruv Panchal',
      age: 26,
      gender: 'male',
      height: 175,
      weight: 78.5,
      targetWeight: 75.0,
      activityLevel: 'moderately_active',
      goal: 'fat_loss',
      dietPreference: 'veg',
      allergies: ['shrimp'],
      dislikedFoods: [],
      preferredFoods: [],
      version: 1,
    },
  });
  console.log('Created user profile.');

  // Create Goal History
  await prisma.goalHistory.create({
    data: {
      userId: user.id,
      calories: 2000,
      protein: 160,
      carbs: 180,
      fats: 60,
      water: 3.2,
      creatine: 5,
      fiber: 30,
      sugar: 50,
      maintenanceCalories: 2500,
      tdee: 2500,
      bmr: 1800,
      calculationFormula: 'Mifflin-St Jeor',
      profileVersion: 1,
      engineVersion: '1.0.0',
      goalSnapshot: JSON.stringify({ calories: 2000, protein: 160, carbs: 180, fats: 60 }),
    }
  });
  console.log('Created user goal history.');

  // 4. Create Demo Catalog Foods (for lookup matching)
  const oatFood = await prisma.food.upsert({
    where: { name: 'Oatmeal with Almonds' },
    update: {},
    create: {
      name: 'Oatmeal with Almonds',
      calories: 320,
      protein: 10,
      carbohydrates: 45,
      fats: 8,
      fiber: 6,
      sugar: 2,
      defaultUnit: 'g',
      servingSize: 100,
      averagePrice: 1.5,
      currency: 'USD',
      source: 'SYSTEM',
    },
  });

  const chickenFood = await prisma.food.upsert({
    where: { name: 'Grilled Chicken Breast with Rice' },
    update: {},
    create: {
      name: 'Grilled Chicken Breast with Rice',
      calories: 550,
      protein: 45,
      carbohydrates: 50,
      fats: 12,
      fiber: 4,
      sugar: 1,
      defaultUnit: 'g',
      servingSize: 350,
      averagePrice: 4.5,
      currency: 'USD',
      source: 'SYSTEM',
    },
  });

  console.log('Seeded standard system catalog foods.');

  // 5. Create Demo Meals
  const today = new Date();
  const meal1 = await prisma.meal.create({
    data: {
      userId: user.id,
      mealType: 'Breakfast',
      source: 'manual',
      createdAt: today,
      items: {
        create: [
          {
            foodName: oatFood.name,
            quantity: 100,
            unit: oatFood.defaultUnit,
            calories: oatFood.calories,
            protein: oatFood.protein,
            carbohydrates: oatFood.carbohydrates,
            fats: oatFood.fats,
            fiber: oatFood.fiber,
            sugar: oatFood.sugar,
            foodId: oatFood.id,
          },
        ],
      },
    },
  });

  const meal2 = await prisma.meal.create({
    data: {
      userId: user.id,
      mealType: 'Lunch',
      source: 'manual',
      createdAt: today,
      items: {
        create: [
          {
            foodName: chickenFood.name,
            quantity: 350,
            unit: chickenFood.defaultUnit,
            calories: chickenFood.calories,
            protein: chickenFood.protein,
            carbohydrates: chickenFood.carbohydrates,
            fats: chickenFood.fats,
            fiber: chickenFood.fiber,
            sugar: chickenFood.sugar,
            foodId: chickenFood.id,
          },
        ],
      },
    },
  });
  console.log('Seeded breakfast and lunch logs.');

  // 6. Create Water & Supplement Logs
  await prisma.waterLog.create({
    data: {
      userId: user.id,
      amount: 1500, // 1.5L
      unit: 'ml',
      createdAt: today,
    },
  });

  await prisma.supplementLog.create({
    data: {
      userId: user.id,
      name: 'Creatine Monohydrate',
      dosage: 5,
      unit: 'g',
      createdAt: today,
    },
  });
  console.log('Seeded water and supplement logs.');

  // 7. Create Exercise Logs
  await prisma.exerciseLog.create({
    data: {
      userId: user.id,
      activityName: 'Strength Training - Push Day',
      durationMinutes: 60,
      caloriesBurned: 350,
      createdAt: today,
    },
  });
  console.log('Seeded exercise logs.');

  // 8. Create AI Conversation & History
  const conversation = await prisma.conversation.create({
    data: {
      userId: user.id,
      title: 'Nutrition Strategy Conversation',
      messages: {
        create: [
          {
            role: 'user',
            content: 'I want to increase my daily protein intake but keep carbohydrates moderate. Any suggestions?',
            tokens: 15,
          },
          {
            role: 'assistant',
            content: 'To increase protein while keeping carbs moderate, focus on lean meats, egg whites, and greek yogurt. Adding a scoop of whey protein to your oatmeal can easily add 25g of protein without increasing carbs significantly.',
            tokens: 45,
          },
        ],
      },
    },
  });
  console.log('Seeded active AI conversation thread.');

  // 9. Create Travel logs
  await prisma.travelSession.create({
    data: {
      userId: user.id,
      active: true,
      startDate: today,
      destination: 'London',
      timezone: 'UTC+1',
      purpose: 'business',
      compensationPlan: {
        create: {
          userId: user.id,
          totalSurplusCalories: 1500,
          dailyReductionCalories: 300,
          recoveryDays: 5,
          recommendedWalkingMinutes: 30,
          recommendedCardioMinutes: 15,
          recommendedStrengthSessions: 2,
          status: 'active',
        }
      }
    }
  });
  console.log('Seeded active travel log session.');

  // 10. Create Meal Plan
  await prisma.mealPlan.create({
    data: {
      userId: user.id,
      title: 'FitMate High Protein Cut',
      type: 'daily',
      goal: 'fat_loss',
      caloriesTarget: 1800,
      proteinTarget: 160,
      carbsTarget: 170,
      fatTarget: 55,
      status: 'active',
      startDate: today,
      endDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
      timezone: 'UTC+3',
      days: {
        create: [
          {
            dayOfWeek: 'Monday',
            calories: 1800,
            protein: 160,
            carbs: 170,
            fats: 55,
            meals: {
              create: [
                {
                  mealType: 'Breakfast',
                  quantity: 100,
                  unit: 'g',
                  calories: 320,
                  protein: 10,
                  carbs: 45,
                  fats: 8,
                  status: 'completed',
                  foodId: oatFood.id,
                },
                {
                  mealType: 'Lunch',
                  quantity: 350,
                  unit: 'g',
                  calories: 550,
                  protein: 45,
                  carbs: 50,
                  fats: 12,
                  status: 'completed',
                  foodId: chickenFood.id,
                },
                {
                  mealType: 'Dinner',
                  quantity: 200,
                  unit: 'g',
                  calories: 400,
                  protein: 35,
                  carbs: 20,
                  fats: 10,
                  status: 'planned',
                  foodId: chickenFood.id,
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log('Seeded active meal plan with planned and completed items.');

  // 11. Create Notifications
  await prisma.notification.create({
    data: {
      userId: user.id,
      type: 'planner',
      title: 'Log dinner',
      body: 'Keep your fat loss streak alive! Remember to log your dinner.',
      read: false,
    },
  });
  console.log('Seeded notification reminders.');

  console.log('Seeding demo data completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during database seed execution:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
