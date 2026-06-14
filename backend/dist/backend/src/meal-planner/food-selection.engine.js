"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodSelectionEngine = void 0;
const common_1 = require("@nestjs/common");
let FoodSelectionEngine = class FoodSelectionEngine {
    rankFoods(candidates, prefs, context) {
        const allergyList = (prefs.allergies || []).map((a) => a.toLowerCase().trim());
        const favoriteList = (prefs.favoriteFoods || []).map((f) => f.toLowerCase().trim());
        const recentList = (prefs.recentMeals || []).map((r) => r.toLowerCase().trim());
        const ranked = candidates
            .filter((food) => {
            const nameLower = food.name.toLowerCase();
            const hasAllergy = allergyList.some((allergy) => nameLower.includes(allergy));
            if (hasAllergy)
                return false;
            if (prefs.dietaryPreference === 'vegetarian') {
                const isNonVeg = ['chicken', 'fish', 'beef', 'pork', 'turkey', 'shrimp', 'salmon', 'mutton'].some((nonVeg) => nameLower.includes(nonVeg));
                if (isNonVeg)
                    return false;
            }
            if (prefs.dietaryPreference === 'vegan') {
                const isNonVegan = ['chicken', 'fish', 'beef', 'pork', 'turkey', 'shrimp', 'salmon', 'mutton', 'milk', 'paneer', 'egg', 'cheese', 'yogurt', 'butter'].some((nonVegan) => nameLower.includes(nonVegan));
                if (isNonVegan)
                    return false;
            }
            return true;
        })
            .map((food) => {
            const nameLower = food.name.toLowerCase();
            let score = 100;
            const isFavorite = favoriteList.some((fav) => nameLower.includes(fav) || fav.includes(nameLower));
            if (isFavorite) {
                score += 50;
            }
            const inPantry = (prefs.pantryItems || []).some((item) => item.foodId === food.id && item.quantity > 0);
            if (inPantry) {
                score += 60;
            }
            const isLeftover = Array.from(context.leftoverIngredients).some((ing) => nameLower.includes(ing.toLowerCase()));
            if (isLeftover) {
                score += 40;
            }
            if (context.alreadySelectedNames.has(food.name)) {
                score -= 45;
            }
            if (prefs.budgetPreference === 'low') {
                if (food.averagePrice) {
                    score -= Math.round(food.averagePrice * 10);
                }
                else {
                    const isPremium = ['salmon', 'avocado', 'almond', 'chia', 'quinoa', 'shrimp'].some((prem) => nameLower.includes(prem));
                    if (isPremium)
                        score -= 30;
                }
            }
            else if (prefs.budgetPreference === 'high') {
                const isPremium = ['salmon', 'quinoa', 'avocado', 'almond'].some((prem) => nameLower.includes(prem));
                if (isPremium)
                    score += 20;
            }
            if (prefs.dietaryPreference === 'high_protein') {
                const proteinRatio = (food.protein * 4) / food.calories;
                if (proteinRatio > 0.3) {
                    score += 30;
                }
            }
            if (context.mealType === 'Breakfast') {
                const isBreakfastFood = ['egg', 'oat', 'chilla', 'toast', 'fruit', 'yogurt', 'milk', 'shake', 'poha', 'upma'].some((bf) => nameLower.includes(bf));
                if (isBreakfastFood)
                    score += 20;
            }
            else if (context.mealType === 'Snack') {
                const isSnackFood = ['nut', 'fruit', 'yogurt', 'shake', 'almond', 'apple', 'salad'].some((sn) => nameLower.includes(sn));
                if (isSnackFood)
                    score += 20;
            }
            else {
                const isMainFood = ['rice', 'roti', 'chicken', 'paneer', 'tofu', 'dal', 'salad', 'curry', 'gravy'].some((mf) => nameLower.includes(mf));
                if (isMainFood)
                    score += 20;
            }
            return { food, score };
        });
        return ranked.sort((a, b) => b.score - a.score);
    }
};
exports.FoodSelectionEngine = FoodSelectionEngine;
exports.FoodSelectionEngine = FoodSelectionEngine = __decorate([
    (0, common_1.Injectable)()
], FoodSelectionEngine);
exports.default = FoodSelectionEngine;
//# sourceMappingURL=food-selection.engine.js.map