import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../../theme/colors';
import { spacing, radius } from '../../../theme/spacing';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useProfile } from '../../../hooks/use-profile';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

const GOALS = [
  { id: 'fat_loss', title: 'Fat Loss', desc: 'Lose body fat while retaining lean muscle.' },
  { id: 'maintenance', title: 'Maintenance', desc: 'Maintain current body weight and optimize health.' },
  { id: 'muscle_gain', title: 'Muscle Gain', desc: 'Build lean mass with a structured calorie surplus.' },
  { id: 'lean_bulk', title: 'Lean Bulk', desc: 'Bulk up slowly to minimize body fat gains.' },
];

const ACTIVITY_LEVELS = [
  { id: 'sedentary', title: 'Sedentary', desc: 'Desk job, little to no exercise.' },
  { id: 'light', title: 'Light Activity', desc: 'Light exercise or active hobbies 1-3 days/week.' },
  { id: 'moderate', title: 'Moderate Activity', desc: 'Moderate workouts or active job 3-5 days/week.' },
  { id: 'active', title: 'Active', desc: 'Intense workouts or athletic job 6-7 days/week.' },
  { id: 'athlete', title: 'Athlete / Professional', desc: 'Heavy sports training or physical labor daily.' },
];

const DIETS = [
  { id: 'veg', title: 'Vegetarian', desc: 'Plant-based diet with dairy.' },
  { id: 'vegan', title: 'Vegan', desc: 'Strictly plant-based, no animal products.' },
  { id: 'eggitarian', title: 'Eggitarian', desc: 'Plant-based including eggs, no meat.' },
  { id: 'non_veg', title: 'Non-Vegetarian', desc: 'Includes chicken, fish, red meat.' },
];

const EXPERIENCES = [
  { id: 'beginner', title: 'Beginner', desc: 'Just starting out (0-6 months training).' },
  { id: 'intermediate', title: 'Intermediate', desc: 'Consistent training for 6-24 months.' },
  { id: 'advanced', title: 'Advanced', desc: 'Structured athletic training for over 2 years.' },
];

interface WizardData {
  gender: string;
  age: string;
  height: string;
  weight: string;
  goal: string;
  activityLevel: string;
  dietPreference: string;
  allergies: string;
  preferredFoods: string;
  dislikedFoods: string;
  mealFrequency: number;
  workoutDays: number;
  gymExperience: string;
  sleepHours: string;
  wakeUpTime: string;
}

export function ProfileWizardContainer() {
  const { profile, updateProfile, saveDraft, loading } = useProfile();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 10;

  // Wizard state pre-populated from current profile draft if it exists
  const [formData, setFormData] = useState<WizardData>({
    gender: 'male',
    age: '',
    height: '',
    weight: '',
    goal: 'maintenance',
    activityLevel: 'sedentary',
    dietPreference: 'non_veg',
    allergies: '',
    preferredFoods: '',
    dislikedFoods: '',
    mealFrequency: 3,
    workoutDays: 3,
    gymExperience: 'beginner',
    sleepHours: '8',
    wakeUpTime: '07:00',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        gender: profile.gender || 'male',
        age: profile.age ? String(profile.age) : '',
        height: profile.height ? String(profile.height) : '',
        weight: profile.weight ? String(profile.weight) : '',
        goal: profile.goal || 'maintenance',
        activityLevel: profile.activityLevel || 'sedentary',
        dietPreference: profile.dietPreference || 'non_veg',
        allergies: profile.allergies ? profile.allergies.join(', ') : '',
        preferredFoods: profile.preferredFoods ? profile.preferredFoods.join(', ') : '',
        dislikedFoods: profile.dislikedFoods ? profile.dislikedFoods.join(', ') : '',
        mealFrequency: profile.mealFrequency || 3,
        workoutDays: profile.workoutDays || 3,
        gymExperience: profile.gymExperience || 'beginner',
        sleepHours: profile.sleepHours ? String(profile.sleepHours) : '8',
        wakeUpTime: profile.wakeUpTime || '07:00',
      });
    }
  }, [profile]);

  // Save draft on step transitions (autosave)
  const saveStepDraft = (nextStep: number) => {
    const dataToSave: any = {
      gender: formData.gender,
      age: formData.age ? parseInt(formData.age, 10) : undefined,
      height: formData.height ? parseFloat(formData.height) : undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      goal: formData.goal,
      activityLevel: formData.activityLevel,
      dietPreference: formData.dietPreference,
      allergies: formData.allergies ? formData.allergies.split(',').map((x) => x.trim()).filter(Boolean) : [],
      preferredFoods: formData.preferredFoods ? formData.preferredFoods.split(',').map((x) => x.trim()).filter(Boolean) : [],
      dislikedFoods: formData.dislikedFoods ? formData.dislikedFoods.split(',').map((x) => x.trim()).filter(Boolean) : [],
      mealFrequency: formData.mealFrequency,
      workoutDays: formData.workoutDays,
      gymExperience: formData.gymExperience,
      sleepHours: formData.sleepHours ? parseFloat(formData.sleepHours) : undefined,
      wakeUpTime: formData.wakeUpTime,
    };

    saveDraft(dataToSave, {
      onSuccess: () => {
        setCurrentStep(nextStep);
      },
    });
  };

  const handleNext = () => {
    // Basic validation on step 1
    if (currentStep === 1) {
      if (!formData.age || !formData.height || !formData.weight) {
        Toast.show({
          type: 'error',
          text1: 'Required Info',
          text2: 'Please enter age, height, and weight to proceed.',
        });
        return;
      }
      const ageVal = parseInt(formData.age, 10);
      const heightVal = parseFloat(formData.height);
      const weightVal = parseFloat(formData.weight);

      if (ageVal < 10 || ageVal > 120 || heightVal < 50 || heightVal > 300 || weightVal < 20 || weightVal > 400) {
        Toast.show({
          type: 'error',
          text1: 'Invalid parameters',
          text2: 'Age (10-120), height (50-300cm), weight (20-400kg)',
        });
        return;
      }
    }

    if (currentStep < totalSteps) {
      saveStepDraft(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    const finalData: any = {
      fullName: profile?.fullName || 'User Profile',
      gender: formData.gender,
      age: parseInt(formData.age, 10),
      height: parseFloat(formData.height),
      weight: parseFloat(formData.weight),
      targetWeight: parseFloat(formData.weight), // Default target weight to start weight
      goal: formData.goal as any,
      activityLevel: formData.activityLevel as any,
      dietPreference: formData.dietPreference as any,
      allergies: formData.allergies ? formData.allergies.split(',').map((x) => x.trim()).filter(Boolean) : [],
      preferredFoods: formData.preferredFoods ? formData.preferredFoods.split(',').map((x) => x.trim()).filter(Boolean) : [],
      dislikedFoods: formData.dislikedFoods ? formData.dislikedFoods.split(',').map((x) => x.trim()).filter(Boolean) : [],
      mealFrequency: formData.mealFrequency,
      workoutDays: formData.workoutDays,
      gymExperience: formData.gymExperience as any,
      sleepHours: parseFloat(formData.sleepHours),
      wakeUpTime: formData.wakeUpTime,
      measurementSystem: 'metric',
    };

    updateProfile(finalData, {
      onSuccess: () => {
        Toast.show({
          type: 'success',
          text1: 'Wizard Complete!',
          text2: 'Your fitness profile and target macros are set.',
        });
      },
    });
  };

  // Render Step Content
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepBox}>
            <Text style={styles.stepTitle}>Tell us about yourself</Text>
            <Text style={styles.stepSubtitle}>We use this to calculate your base metabolic rate.</Text>

            <Text style={styles.inputLabel}>Gender</Text>
            <View style={styles.toggleRow}>
              {['male', 'female', 'other'].map((g) => (
                <Pressable
                  key={g}
                  style={[styles.toggleBtn, formData.gender === g && styles.toggleBtnActive]}
                  onPress={() => setFormData({ ...formData, gender: g })}
                >
                  <Text style={[styles.toggleText, formData.gender === g && styles.toggleTextActive]}>
                    {g.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.inputLabel}>Age (years)</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="number-pad"
              value={formData.age}
              onChangeText={(t) => setFormData({ ...formData, age: t })}
              placeholder="e.g. 28"
              placeholderTextColor={colors.onSurfaceSecondary}
            />

            <Text style={styles.inputLabel}>Height (cm)</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={formData.height}
              onChangeText={(t) => setFormData({ ...formData, height: t })}
              placeholder="e.g. 175"
              placeholderTextColor={colors.onSurfaceSecondary}
            />

            <Text style={styles.inputLabel}>Weight (kg)</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={formData.weight}
              onChangeText={(t) => setFormData({ ...formData, weight: t })}
              placeholder="e.g. 72.5"
              placeholderTextColor={colors.onSurfaceSecondary}
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepBox}>
            <Text style={styles.stepTitle}>What is your primary goal?</Text>
            <Text style={styles.stepSubtitle}>Your macro adjustments are based directly on this goal.</Text>

            {GOALS.map((g) => (
              <Card
                key={g.id}
                variant="solid"
                onPress={() => setFormData({ ...formData, goal: g.id })}
                style={StyleSheet.flatten([styles.optionCard, formData.goal === g.id && styles.optionCardActive])}
              >
                <View style={styles.optionHeader}>
                  <Text style={styles.optionTitle}>{g.title}</Text>
                  {formData.goal === g.id && <Ionicons name="checkmark-circle" size={20} color={colors.brand} />}
                </View>
                <Text style={styles.optionDesc}>{g.desc}</Text>
              </Card>
            ))}
          </View>
        );

      case 3:
        return (
          <View style={styles.stepBox}>
            <Text style={styles.stepTitle}>Select your activity level</Text>
            <Text style={styles.stepSubtitle}>TDEE is computed from your activity multiplier.</Text>

            {ACTIVITY_LEVELS.map((act) => (
              <Card
                key={act.id}
                variant="solid"
                onPress={() => setFormData({ ...formData, activityLevel: act.id })}
                style={StyleSheet.flatten([styles.optionCard, formData.activityLevel === act.id && styles.optionCardActive])}
              >
                <View style={styles.optionHeader}>
                  <Text style={styles.optionTitle}>{act.title}</Text>
                  {formData.activityLevel === act.id && <Ionicons name="checkmark-circle" size={20} color={colors.brand} />}
                </View>
                <Text style={styles.optionDesc}>{act.desc}</Text>
              </Card>
            ))}
          </View>
        );

      case 4:
        return (
          <View style={styles.stepBox}>
            <Text style={styles.stepTitle}>Dietary preference</Text>
            <Text style={styles.stepSubtitle}>AI uses this to filter meal planner options.</Text>

            {DIETS.map((d) => (
              <Card
                key={d.id}
                variant="solid"
                onPress={() => setFormData({ ...formData, dietPreference: d.id })}
                style={StyleSheet.flatten([styles.optionCard, formData.dietPreference === d.id && styles.optionCardActive])}
              >
                <View style={styles.optionHeader}>
                  <Text style={styles.optionTitle}>{d.title}</Text>
                  {formData.dietPreference === d.id && <Ionicons name="checkmark-circle" size={20} color={colors.brand} />}
                </View>
                <Text style={styles.optionDesc}>{d.desc}</Text>
              </Card>
            ))}
          </View>
        );

      case 5:
        return (
          <View style={styles.stepBox}>
            <Text style={styles.stepTitle}>Do you have allergies?</Text>
            <Text style={styles.stepSubtitle}>Comma-separated values (e.g. peanuts, dairy, gluten)</Text>

            <TextInput
              style={[styles.textInput, styles.areaInput]}
              multiline
              value={formData.allergies}
              onChangeText={(t) => setFormData({ ...formData, allergies: t })}
              placeholder="e.g. peanuts, eggs"
              placeholderTextColor={colors.onSurfaceSecondary}
            />
          </View>
        );

      case 6:
        return (
          <View style={styles.stepBox}>
            <Text style={styles.stepTitle}>What are your favorite foods?</Text>
            <Text style={styles.stepSubtitle}>AI Meal Planner prioritizes these foods (comma-separated)</Text>

            <TextInput
              style={[styles.textInput, styles.areaInput]}
              multiline
              value={formData.preferredFoods}
              onChangeText={(t) => setFormData({ ...formData, preferredFoods: t })}
              placeholder="e.g. chicken breast, oats, quinoa"
              placeholderTextColor={colors.onSurfaceSecondary}
            />
          </View>
        );

      case 7:
        return (
          <View style={styles.stepBox}>
            <Text style={styles.stepTitle}>Any disliked foods?</Text>
            <Text style={styles.stepSubtitle}>AI will avoid proposing these ingredients in planner (comma-separated)</Text>

            <TextInput
              style={[styles.textInput, styles.areaInput]}
              multiline
              value={formData.dislikedFoods}
              onChangeText={(t) => setFormData({ ...formData, dislikedFoods: t })}
              placeholder="e.g. eggplant, tofu"
              placeholderTextColor={colors.onSurfaceSecondary}
            />
          </View>
        );

      case 8:
        return (
          <View style={styles.stepBox}>
            <Text style={styles.stepTitle}>Meal Frequency & Sleep</Text>
            <Text style={styles.stepSubtitle}>Helps divide meals and adjust calorie partitions.</Text>

            <Text style={styles.inputLabel}>Meal Frequency (per day)</Text>
            <View style={styles.counterRow}>
              <Pressable
                style={styles.countBtn}
                onPress={() => setFormData({ ...formData, mealFrequency: Math.max(1, formData.mealFrequency - 1) })}
              >
                <Text style={styles.countBtnText}>-</Text>
              </Pressable>
              <Text style={styles.counterValue}>{formData.mealFrequency} meals</Text>
              <Pressable
                style={styles.countBtn}
                onPress={() => setFormData({ ...formData, mealFrequency: Math.min(6, formData.mealFrequency + 1) })}
              >
                <Text style={styles.countBtnText}>+</Text>
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Sleep Duration (hours per night)</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={formData.sleepHours}
              onChangeText={(t) => setFormData({ ...formData, sleepHours: t })}
              placeholder="e.g. 7.5"
              placeholderTextColor={colors.onSurfaceSecondary}
            />

            <Text style={styles.inputLabel}>Wake Up Time</Text>
            <TextInput
              style={styles.textInput}
              value={formData.wakeUpTime}
              onChangeText={(t) => setFormData({ ...formData, wakeUpTime: t })}
              placeholder="e.g. 07:00"
              placeholderTextColor={colors.onSurfaceSecondary}
            />
          </View>
        );

      case 9:
        return (
          <View style={styles.stepBox}>
            <Text style={styles.stepTitle}>Gym Habits & Experience</Text>
            <Text style={styles.stepSubtitle}>Tuning creatine and active recovery coefficients.</Text>

            <Text style={styles.inputLabel}>Workout Days (per week)</Text>
            <View style={styles.counterRow}>
              <Pressable
                style={styles.countBtn}
                onPress={() => setFormData({ ...formData, workoutDays: Math.max(0, formData.workoutDays - 1) })}
              >
                <Text style={styles.countBtnText}>-</Text>
              </Pressable>
              <Text style={styles.counterValue}>{formData.workoutDays} days</Text>
              <Pressable
                style={styles.countBtn}
                onPress={() => setFormData({ ...formData, workoutDays: Math.min(7, formData.workoutDays + 1) })}
              >
                <Text style={styles.countBtnText}>+</Text>
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Gym Experience</Text>
            {EXPERIENCES.map((exp) => (
              <Card
                key={exp.id}
                variant="solid"
                onPress={() => setFormData({ ...formData, gymExperience: exp.id })}
                style={StyleSheet.flatten([styles.optionCard, formData.gymExperience === exp.id && styles.optionCardActive])}
              >
                <View style={styles.optionHeader}>
                  <Text style={styles.optionTitle}>{exp.title}</Text>
                  {formData.gymExperience === exp.id && <Ionicons name="checkmark-circle" size={20} color={colors.brand} />}
                </View>
                <Text style={styles.optionDesc}>{exp.desc}</Text>
              </Card>
            ))}
          </View>
        );

      case 10:
        return (
          <View style={styles.stepBox}>
            <Text style={styles.stepTitle}>Review & Confirm</Text>
            <Text style={styles.stepSubtitle}>Verify your inputs. Submitting will calculate your target macros.</Text>

            <Card variant="solid" style={styles.reviewCard}>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Age / Gender</Text>
                <Text style={styles.reviewVal}>{formData.age} yrs • {formData.gender}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Height / Weight</Text>
                <Text style={styles.reviewVal}>{formData.height} cm • {formData.weight} kg</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Goal</Text>
                <Text style={styles.reviewVal}>{formData.goal.replace('_', ' ')}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Activity</Text>
                <Text style={styles.reviewVal}>{formData.activityLevel}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Diet</Text>
                <Text style={styles.reviewVal}>{formData.dietPreference}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Workouts</Text>
                <Text style={styles.reviewVal}>{formData.workoutDays} days/wk ({formData.gymExperience})</Text>
              </View>
            </Card>

            <Button
              title="Calculate Targets & Finish"
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitBtn}
            />
          </View>
        );

      default:
        return null;
    }
  };

  const progressPercent = (currentStep / totalSteps) * 100;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScreenHeader title="Fitness Setup" subtitle={`Step ${currentStep} of ${totalSteps}`} />

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderStep()}

        {/* Action Controls */}
        <View style={styles.controlsRow}>
          {currentStep > 1 && (
            <Button title="Back" onPress={handleBack} variant="outline" style={styles.controlBtn} />
          )}
          {currentStep < totalSteps ? (
            <Button title="Continue" onPress={handleNext} style={styles.controlBtn} />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: colors.surfaceTertiary,
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.brand,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  stepBox: {
    gap: spacing.md,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.onSurface,
  },
  stepSubtitle: {
    fontSize: 12,
    color: colors.onSurfaceSecondary,
    marginBottom: spacing.sm,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
    marginTop: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.onSurface,
    fontSize: 14,
  },
  areaInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  toggleBtn: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  toggleBtnActive: {
    borderColor: colors.brand,
    backgroundColor: `${colors.brand}10`,
  },
  toggleText: {
    fontSize: 13,
    color: colors.onSurfaceSecondary,
    fontWeight: '700',
  },
  toggleTextActive: {
    color: colors.brand,
  },
  optionCard: {
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  optionCardActive: {
    borderColor: colors.brand,
    backgroundColor: `${colors.brand}05`,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.onSurface,
  },
  optionDesc: {
    fontSize: 11,
    color: colors.onSurfaceSecondary,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  countBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBtnText: {
    fontSize: 20,
    color: colors.onSurface,
    fontWeight: '600',
  },
  counterValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
  },
  reviewCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: colors.divider,
    paddingBottom: spacing.xs,
  },
  reviewLabel: {
    fontSize: 13,
    color: colors.onSurfaceSecondary,
  },
  reviewVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onSurface,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  controlBtn: {
    flex: 1,
  },
  submitBtn: {
    marginTop: spacing.md,
  },
});

export default ProfileWizardContainer;
