using webapi.Models.Flexibility;

namespace webapi.Data.Examples
{
    public static class FlexibilityExamples
    {
        public static List<FlexibilityExerciseEntry> GetFlexibilityExercises()
        {
            return new List<FlexibilityExerciseEntry>()
            {
                new()
                {
                    ExerciseType = FlexibilityExerciseType.Suitability,
                    ExerciseId = 1 // 1
                },
                new()
                {
                    ExerciseType = FlexibilityExerciseType.Efficiency,
                    ExerciseId = 1 // 2
                },
                new()
                {
                    ExerciseType = FlexibilityExerciseType.Suitability,
                    ExerciseId = 2 // 3
                },
                new()
                {
                    ExerciseType = FlexibilityExerciseType.Matching,
                    ExerciseId = 1 // 4
                },
                new()
                {
                    ExerciseType = FlexibilityExerciseType.Suitability,
                    ExerciseId = 3 // 5
                },
                new()
                {
                    ExerciseType = FlexibilityExerciseType.Efficiency,
                    ExerciseId = 2 // 6
                },
                new()
                {
                    ExerciseType = FlexibilityExerciseType.Matching,
                    ExerciseId = 2 // 7
                },
                new()
                {
                    ExerciseType = FlexibilityExerciseType.Suitability,
                    ExerciseId = 4 // 8
                },
                new()
                {
                    ExerciseType = FlexibilityExerciseType.Matching,
                    ExerciseId = 3 // 9
                },
                new()
                {
                    ExerciseType = FlexibilityExerciseType.Suitability,
                    ExerciseId = 5 // 11
                },
                new()
                {
                    ExerciseType = FlexibilityExerciseType.Efficiency,
                    ExerciseId = 3 // 13
                },
                new()
                {
                    ExerciseType = FlexibilityExerciseType.Suitability,
                    ExerciseId = 6 // 14
                },
                new()
                {
                    ExerciseType = FlexibilityExerciseType.Matching,
                    ExerciseId = 4 // 15
                },
                new()
                {
                    ExerciseType = FlexibilityExerciseType.Suitability,
                    ExerciseId = 7 // 16
                }
            };
        }
    }
}
