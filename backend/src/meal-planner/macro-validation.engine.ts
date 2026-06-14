import { Injectable } from '@nestjs/common';

@Injectable()
export class MacroValidationEngine {
  validateAndRebalance(
    days: any[],
    targets: { calories: number; protein: number; carbs: number; fats: number }
  ): { isValid: boolean; rebalancedDays: any[] } {
    const rebalancedDays = days.map((day) => {
      let dayCalories = 0;
      let dayProtein = 0;
      let dayCarbs = 0;
      let dayFats = 0;

      for (const meal of day.meals) {
        dayCalories += meal.calories || 0;
        dayProtein += meal.protein || 0;
        dayCarbs += meal.carbs || 0;
        dayFats += meal.fats || 0;
      }

      // If day is empty or calories are zero, we can't scale
      if (dayCalories === 0) {
        return { ...day, calories: 0, protein: 0, carbs: 0, fats: 0 };
      }

      // Check deviation
      const calDiff = Math.abs(dayCalories - targets.calories) / targets.calories;
      
      // If deviation is greater than 5% (0.05), we apply scaling rebalance
      if (calDiff > 0.05) {
        const scale = targets.calories / dayCalories;
        
        const rebalancedMeals = day.meals.map((meal: any) => {
          const newQty = Math.round(meal.quantity * scale * 10) / 10;
          return {
            ...meal,
            quantity: newQty,
            calories: Math.round(meal.calories * scale),
            protein: Math.round(meal.protein * scale * 10) / 10,
            carbs: Math.round(meal.carbs * scale * 10) / 10,
            fats: Math.round(meal.fats * scale * 10) / 10,
          };
        });

        // Recalculate scaled totals
        let finalCal = 0;
        let finalProt = 0;
        let finalCarbs = 0;
        let finalFats = 0;
        for (const m of rebalancedMeals) {
          finalCal += m.calories;
          finalProt += m.protein;
          finalCarbs += m.carbs;
          finalFats += m.fats;
        }

        return {
          ...day,
          calories: finalCal,
          protein: Math.round(finalProt * 10) / 10,
          carbs: Math.round(finalCarbs * 10) / 10,
          fats: Math.round(finalFats * 10) / 10,
          meals: rebalancedMeals,
        };
      }

      return {
        ...day,
        calories: dayCalories,
        protein: Math.round(dayProtein * 10) / 10,
        carbs: Math.round(dayCarbs * 10) / 10,
        fats: Math.round(dayFats * 10) / 10,
      };
    });

    // Final verification check: Ensure all days are within 5% limit
    let allValid = true;
    for (const d of rebalancedDays) {
      if (d.calories === 0) {
        allValid = false;
        break;
      }
      const finalCalDiff = Math.abs(d.calories - targets.calories) / targets.calories;
      if (finalCalDiff > 0.05) {
        allValid = false;
      }
    }

    return {
      isValid: allValid,
      rebalancedDays,
    };
  }
}
export default MacroValidationEngine;
