import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { aiService } from '../services/ai-service';
import { nutritionService } from '../services/nutrition-service';
import { ScanItemDraft, MealScanResponse, FoodResponse } from '../../../../shared/contracts';
import Toast from 'react-native-toast-message';

export type ScanState = 'idle' | 'previewing' | 'scanning' | 'editing' | 'saving' | 'error';

export function useScan() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [scanState, setScanState] = useState<ScanState>('idle');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [scanId, setScanId] = useState<string | null>(null);
  const [items, setItems] = useState<ScanItemDraft[]>([]);
  const [mealType, setMealType] = useState<string>('Lunch');

  // 1. Scan Mutation
  const scanMutation = useMutation({
    mutationFn: (url: string) => aiService.scanImage(url),
    onMutate: () => {
      setScanState('scanning');
    },
    onSuccess: (data: MealScanResponse) => {
      setScanId(data.id);
      setItems(data.items);
      setScanState('editing');
    },
    onError: () => {
      setScanState('error');
      Toast.show({
        type: 'error',
        text1: 'Scan Failed',
        text2: 'Could not analyze image. Please try again.',
      });
    },
  });

  // 2. Retry Mutation
  const retryMutation = useMutation({
    mutationFn: (id: string) => aiService.retryScan(id),
    onMutate: () => {
      setScanState('scanning');
    },
    onSuccess: (data: MealScanResponse) => {
      setItems(data.items);
      setScanState('editing');
      Toast.show({
        type: 'success',
        text1: 'Analysis Retried',
        text2: 'Detected items refreshed.',
      });
    },
    onError: () => {
      setScanState('editing');
      Toast.show({
        type: 'error',
        text1: 'Retry Failed',
        text2: 'Could not re-analyze image.',
      });
    },
  });

  // 3. Confirm Mutation
  const confirmMutation = useMutation({
    mutationFn: () => {
      if (!scanId) throw new Error('No scan ID');
      return aiService.confirmScan({
        scanId,
        mealType,
        items: items.map((i) => ({
          foodName: i.foodName,
          quantity: i.quantity,
          unit: i.unit,
          calories: i.calories,
          protein: i.protein,
          carbohydrates: i.carbohydrates,
          fats: i.fats,
          fiber: i.fiber,
          sugar: i.sugar,
          foodId: i.foodId,
        })),
      });
    },
    onMutate: () => {
      setScanState('saving');
    },
    onSuccess: () => {
      // Invalidate dashboard totals
      queryClient.invalidateQueries({ queryKey: ['todayLogs'] });
      queryClient.invalidateQueries({ queryKey: ['todayMeals'] });

      Toast.show({
        type: 'success',
        text1: 'Meal Saved',
        text2: 'Added to your daily logs!',
      });
      router.replace('/(tabs)/dashboard' as any);
    },
    onError: () => {
      setScanState('editing');
      Toast.show({
        type: 'error',
        text1: 'Saving Failed',
        text2: 'Could not log meal to your dashboard.',
      });
    },
  });

  // Actions
  const handleCapture = (uri: string) => {
    setImageUri(uri);
    setScanState('previewing');
  };

  const handleUpload = () => {
    if (imageUri) {
      scanMutation.mutate(imageUri);
    }
  };

  const handleRetake = () => {
    setImageUri(null);
    setScanId(null);
    setItems([]);
    setScanState('idle');
  };

  const handleRetry = () => {
    if (scanId) {
      retryMutation.mutate(scanId);
    }
  };

  // Editing actions
  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;

        // Scale macros proportionally based on quantity change
        const scale = newQty / item.quantity;
        return {
          ...item,
          quantity: newQty,
          calories: Math.round(item.calories * scale),
          protein: Math.round(item.protein * scale * 10) / 10,
          carbohydrates: Math.round(item.carbohydrates * scale * 10) / 10,
          fats: Math.round(item.fats * scale * 10) / 10,
          fiber: Math.round(item.fiber * scale * 10) / 10,
          sugar: Math.round(item.sugar * scale * 10) / 10,
        };
      })
    );
  };

  const handleReplaceFood = (itemId: string, selectedFood: FoodResponse) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;

        // Replace item entirely with catalog food, using item's quantity
        const quantity = item.quantity;
        const scale = quantity / selectedFood.servingSize;
        return {
          ...item,
          foodName: selectedFood.name,
          unit: selectedFood.defaultUnit,
          foodId: selectedFood.id,
          calories: Math.round(selectedFood.calories * scale),
          protein: Math.round(selectedFood.protein * scale * 10) / 10,
          carbohydrates: Math.round(selectedFood.carbohydrates * scale * 10) / 10,
          fats: Math.round(selectedFood.fats * scale * 10) / 10,
          fiber: Math.round(selectedFood.fiber * scale * 10) / 10,
          sugar: Math.round(selectedFood.sugar * scale * 10) / 10,
        };
      })
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Calculate live dynamic sums
  const totalMacros = items.reduce(
    (sums, item) => ({
      calories: sums.calories + item.calories,
      protein: sums.protein + item.protein,
      carbohydrates: sums.carbohydrates + item.carbohydrates,
      fats: sums.fats + item.fats,
      fiber: sums.fiber + item.fiber,
      sugar: sums.sugar + item.sugar,
    }),
    { calories: 0, protein: 0, carbohydrates: 0, fats: 0, fiber: 0, sugar: 0 }
  );

  return {
    scanState,
    imageUri,
    items,
    mealType,
    setMealType,
    totalMacros,
    handleCapture,
    handleUpload,
    handleRetake,
    handleRetry,
    handleUpdateQuantity,
    handleReplaceFood,
    handleRemoveItem,
    saveMeal: () => confirmMutation.mutate(),
  };
}
export default useScan;
