import { OnModuleInit } from '@nestjs/common';
import { FoodsRepository } from './foods.repository';
export declare class FoodsService implements OnModuleInit {
    private readonly repository;
    private fallbackFoods;
    constructor(repository: FoodsRepository);
    onModuleInit(): Promise<void>;
    searchFoods(query: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        source: import("src/generated/prisma").$Enums.FoodSource;
        calories: number;
        protein: number;
        carbohydrates: number;
        fats: number;
        fiber: number;
        sugar: number;
        defaultUnit: string;
        servingSize: number;
    }[] | ({
        readonly name: "Oatmeal";
        readonly calories: 150;
        readonly protein: 6;
        readonly carbohydrates: 27;
        readonly fats: 3;
        readonly fiber: 4;
        readonly sugar: 1;
        readonly defaultUnit: "g";
        readonly servingSize: 40;
        readonly source: "SYSTEM";
    } | {
        readonly name: "Chicken Breast";
        readonly calories: 165;
        readonly protein: 31;
        readonly carbohydrates: 0;
        readonly fats: 3.6;
        readonly fiber: 0;
        readonly sugar: 0;
        readonly defaultUnit: "g";
        readonly servingSize: 100;
        readonly source: "SYSTEM";
    } | {
        readonly name: "Hard Boiled Egg";
        readonly calories: 78;
        readonly protein: 6.3;
        readonly carbohydrates: 0.6;
        readonly fats: 5.3;
        readonly fiber: 0;
        readonly sugar: 0.6;
        readonly defaultUnit: "piece";
        readonly servingSize: 1;
        readonly source: "SYSTEM";
    } | {
        readonly name: "Paneer";
        readonly calories: 265;
        readonly protein: 18;
        readonly carbohydrates: 1.2;
        readonly fats: 20.8;
        readonly fiber: 0;
        readonly sugar: 1.2;
        readonly defaultUnit: "g";
        readonly servingSize: 100;
        readonly source: "SYSTEM";
    } | {
        readonly name: "White Rice";
        readonly calories: 130;
        readonly protein: 2.7;
        readonly carbohydrates: 28;
        readonly fats: 0.3;
        readonly fiber: 0.4;
        readonly sugar: 0.1;
        readonly defaultUnit: "g";
        readonly servingSize: 100;
        readonly source: "SYSTEM";
    } | {
        readonly name: "Whey Protein";
        readonly calories: 120;
        readonly protein: 24;
        readonly carbohydrates: 3;
        readonly fats: 1.5;
        readonly fiber: 0;
        readonly sugar: 1;
        readonly defaultUnit: "scoop";
        readonly servingSize: 1;
        readonly source: "SYSTEM";
    } | {
        readonly name: "Apple";
        readonly calories: 95;
        readonly protein: 0.5;
        readonly carbohydrates: 25;
        readonly fats: 0.3;
        readonly fiber: 4.4;
        readonly sugar: 19;
        readonly defaultUnit: "piece";
        readonly servingSize: 1;
        readonly source: "SYSTEM";
    } | {
        readonly name: "Banana";
        readonly calories: 105;
        readonly protein: 1.3;
        readonly carbohydrates: 27;
        readonly fats: 0.4;
        readonly fiber: 3.1;
        readonly sugar: 14;
        readonly defaultUnit: "piece";
        readonly servingSize: 1;
        readonly source: "SYSTEM";
    })[]>;
}
