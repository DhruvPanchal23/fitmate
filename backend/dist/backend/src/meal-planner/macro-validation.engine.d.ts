export declare class MacroValidationEngine {
    validateAndRebalance(days: any[], targets: {
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
    }): {
        isValid: boolean;
        rebalancedDays: any[];
    };
}
export default MacroValidationEngine;
