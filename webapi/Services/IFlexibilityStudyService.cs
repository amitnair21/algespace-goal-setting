using System.Text.Json;
using Dapper;
using webapi.Models.Database;
using webapi.Models.Studies.Flexibility;

namespace webapi.Services
{
    public interface IFlexibilityStudyService
    {
        void AddStudy(long studyId, List<FlexibilityStudyExercise> exercises);

        List<FlexibilityStudyExercise>? GetExercises(long studyId);

        int InitializeEntry(FlexibilityStudyData data, string username);

        void AddActionToEntry(long userId, string username, long studyId, long rowId, string columnName, string action);

        void TrackChoice(long userId, string username, long studyId, long rowId, string columnName, string choice);

        void CompleteTrackingForEntry(long userId, string username, long studyId, long rowId, float time, int errors);

        void CompletePhaseTrackingForEntry(long userId, string username, long studyId, long rowId, string columnName, float time, int errors);

        void CompletePhaseTrackingForComparisonOrResolveEntry(long userId, string username, long studyId, long rowId, string columnName, float time, int errors, string choice);
    }

    public class FlexibilityStudyService : IFlexibilityStudyService
    {
        public void AddStudy(long studyId, List<FlexibilityStudyExercise> exercises)
        {
            using var connection = DBSettings.GetSQLiteConnectionForStudiesDB();
            connection.Open();

            FlexibilityStudy study = new(studyId);

            DBUtils.CreateOrClearTable(connection, FlexibilityStudyDBSettings.TableName, FlexibilityStudyDBSettings.TableScheme, false);
            string inserQuery = $"INSERT INTO {FlexibilityStudyDBSettings.TableName} {FlexibilityStudyDBSettings.TableColumns} VALUES {FlexibilityStudyDBSettings.TableValues}";
            connection.Execute(inserQuery, study);

            DBUtils.CreateOrClearTable(connection, study.TableName, FlexibilityStudyExerciseDBSettings.TableScheme, true);
            inserQuery = $"INSERT INTO {study.TableName} {FlexibilityStudyExerciseDBSettings.TableColumns} VALUES {FlexibilityStudyExerciseDBSettings.TableValues}";
            foreach (FlexibilityStudyExercise exercise in exercises)
            {
                connection.Execute(inserQuery, exercise);
            }
        }

        public List<FlexibilityStudyExercise>? GetExercises(long studyId)
        {
            using var connection = DBSettings.GetSQLiteConnectionForStudiesDB();
            connection.Open();
            string query = $"SELECT TableName FROM {FlexibilityStudyDBSettings.TableName} WHERE StudyId = @Id";
            string? tableName = connection.ExecuteScalar<string>(query, new { Id = studyId });

            if (tableName == null)
            {
                return null;
            }

            query = $"SELECT * FROM {tableName}";
            var result = connection.Query<FlexibilityStudyExercise>(query);
            return result.ToList();
        }

        public int InitializeEntry(FlexibilityStudyData data, string username)
        {
            string tableName = FlexibilityStudyDataDBSettings.GetTableName(data.StudyId, data.UserId, username);
            using var connection = DBSettings.GetSQLiteConnectionForStudiesDB();
            connection.Open();
            DBUtils.CreateOrClearTable(connection, tableName, FlexibilityStudyDataDBSettings.TableScheme, false);
            string inserQuery = $"INSERT INTO {tableName} {FlexibilityStudyDataDBSettings.TableColumns} VALUES {FlexibilityStudyDataDBSettings.TableValues}; SELECT last_insert_rowid()";
            int id = connection.ExecuteScalar<int>(inserQuery, data);
            return id;
        }

        public void AddActionToEntry(long userId, string username, long studyId, long rowId, string columnName, string action)
        {
            string tableName = FlexibilityStudyDataDBSettings.GetTableName(studyId, userId, username);
            using var connection = DBSettings.GetSQLiteConnectionForStudiesDB();
            connection.Open();
            string query = $"SELECT {columnName} FROM {tableName} WHERE Id = @Id";
            string? previousActions = connection.ExecuteScalar<string>(query, new { Id = rowId });
            query = $"UPDATE {tableName} SET {columnName} = @Actions WHERE Id = @Id";
            if (!string.IsNullOrEmpty(previousActions))
            {
                connection.Execute(query, new { Actions = previousActions + ",\n" + action, Id = rowId });
            }
            else
            {
                connection.Execute(query, new { Actions = action, Id = rowId });
            }
        }

        public void TrackChoice(long userId, string username, long studyId, long rowId, string columnName, string choice)
        {
            string tableName = FlexibilityStudyDataDBSettings.GetTableName(studyId, userId, username);
            using var connection = DBSettings.GetSQLiteConnectionForStudiesDB();
            connection.Open();
            string query = $"UPDATE {tableName} SET {columnName} = @Column WHERE Id = @Id";
            connection.Execute(query, new { Column = choice, Id = rowId });
        }

        public void CompleteTrackingForEntry(long userId, string username, long studyId, long rowId, float time, int errors)
        {
            string tableName = FlexibilityStudyDataDBSettings.GetTableName(studyId, userId, username);
            using var connection = DBSettings.GetSQLiteConnectionForStudiesDB();
            connection.Open();
            string query = $"UPDATE {tableName} SET TotalTime = @Time, TotalErrors = @Errors WHERE Id = @Id";
            connection.Execute(query, new { Time = time, Errors = errors, Id = rowId });
        }

        public void CompletePhaseTrackingForEntry(long userId, string username, long studyId, long rowId, string columnName, float time, int errors)
        {
            string tableName = FlexibilityStudyDataDBSettings.GetTableName(studyId, userId, username);
            using var connection = DBSettings.GetSQLiteConnectionForStudiesDB();
            connection.Open();
            string query = $"UPDATE {tableName} SET {columnName} = @Column WHERE Id = @Id";
            string columnData = JsonSerializer.Serialize(new FlexibilityExercisePhaseData { Time = time, Errors = errors });
            connection.Execute(query, new { Column = columnData, Id = rowId });
        }

        public void CompletePhaseTrackingForComparisonOrResolveEntry(long userId, string username, long studyId, long rowId, string columnName, float time, int errors, string choice)
        {
            string tableName = FlexibilityStudyDataDBSettings.GetTableName(studyId, userId, username);
            using var connection = DBSettings.GetSQLiteConnectionForStudiesDB();
            connection.Open();
            string query = $"UPDATE {tableName} SET {columnName} = @Column WHERE Id = @Id";
            string columnData = JsonSerializer.Serialize(new FlexibilityComparisonOrResolveData { Time = time, Errors = errors, Choice = choice });
            connection.Execute(query, new { Column = columnData, Id = rowId });
        }
    }
}