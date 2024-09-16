using Microsoft.AspNetCore.Mvc;
using webapi.AuthHelpers;
using webapi.Data.Examples;
using webapi.Models.Studies.Flexibility;
using webapi.Services;

namespace webapi.Controllers
{
    [ApiController]
    [Route("flexibility-study")]
    public class FlexibilityStudyController(IFlexibilityStudyService studyService) : Controller
    {
        private IFlexibilityStudyService _studyService = studyService;

        [Authorize]
        [HttpGet(template: "getExercisesForStudy/{id}")]
        public ActionResult<List<FlexibilityStudyExercise>> GetExercisesForStudy(long id)
        {
            try
            {
                var exercises = _studyService.GetExercises(id);
                if (exercises == null)
                {
                    return NotFound();
                }
                return exercises;
            }
            catch (Exception exception)
            {
                return BadRequest(exception.Message);
            }
        }

        [HttpPut(template: "setFirstStudy")]
        private IActionResult SetFirstStudy()
        {
            try
            {
                _studyService.AddStudy(1, FlexibilityStudyExamples.GetFirstStudy());
                return Ok();
            }
            catch (Exception exception)
            {
                return BadRequest(exception.Message);
            }
        }

        [Authorize]
        [HttpPut(template: "createEntry")]
        public ActionResult<int> CreateEntryForExercise(CreateFlexibilityEntryRequest data)
        {
            try
            {
                FlexibilityStudyData studyData = new(data.UserId, data.StudyId, data.FlexibilityId, data.ExerciseId, data.ExerciseType, data.AgentCondition, data.AgentType);
                return _studyService.InitializeEntry(studyData, data.Username);
            }
            catch (Exception exception)
            {
                return BadRequest(exception.Message);
            }
        }

        [Authorize]
        [HttpPost(template: "addActionToEntry")]
        public IActionResult AddActionToEntry(TrackFlexibilityActionRequest data)
        {
            try
            {
                _studyService.AddActionToEntry(data.UserId, data.Username, data.StudyId, data.Id, data.Phase.ToString(), data.Action);
                return new OkResult();
            }
            catch (Exception exception)
            {
                return BadRequest(exception.Message);
            }
        }

        [Authorize]
        [HttpPost(template: "trackChoice")]
        public IActionResult TrackEliminationChoice(TrackFlexibilityChoiceRequest data)
        {
            try
            {
                _studyService.TrackChoice(data.UserId, data.Username, data.StudyId, data.Id, data.Phase.ToString(), data.Choice);
                return new OkResult();
            }
            catch (Exception exception)
            {
                return BadRequest(exception.Message);
            }
        }

        [Authorize]
        [HttpPost(template: "completePhaseTracking")]
        public IActionResult CompletePhaseTracking(CompleteFlexibilityTrackingRequest data)
        {
            try
            {
                if (data.Phase == null)
                {
                    return BadRequest("Property Phase is null.");
                }

                if (data.Phase == FlexibilityExercisePhase.Comparison || data.Phase == FlexibilityExercisePhase.ResolveConclusion)
                {
                    _studyService.CompletePhaseTrackingForComparisonOrResolveEntry(data.UserId, data.Username, data.StudyId, data.Id, ((FlexibilityExercisePhase)data.Phase).ToString(), data.Time, data.Errors, data.Choice ?? "");
                }
                else
                {
                    _studyService.CompletePhaseTrackingForEntry(data.UserId, data.Username, data.StudyId, data.Id, ((FlexibilityExercisePhase)data.Phase).ToString(), data.Time, data.Errors);
                }

                return new OkResult();
            }
            catch (Exception exception)
            {
                return BadRequest(exception.Message);
            }
        }

        [Authorize]
        [HttpPost(template: "completeTracking")]
        public IActionResult CompleteTracking(CompleteFlexibilityTrackingRequest data)
        {
            try
            {
                _studyService.CompleteTrackingForEntry(data.UserId, data.Username, data.StudyId, data.Id, data.Time, data.Errors);
                return new OkResult();
            }
            catch (Exception exception)
            {
                return BadRequest(exception.Message);
            }
        }
    }
}
