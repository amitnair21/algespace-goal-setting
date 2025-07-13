using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using webapi.AuthHelpers;
using webapi.Data.Examples;
using webapi.Models.ConceptualKnowledge;
using webapi.Models.Database;
using webapi.Services;

namespace webapi.Controllers
{
  [ApiController]
  [Route("equalization")]
  public class EqualizationController : ControllerBase
  {
    private readonly ICKExerciseService _exerciseService;

    // ← proper constructor injection
    public EqualizationController(ICKExerciseService exerciseService)
    {
      _exerciseService = exerciseService;
    }

    // POST /equalization/conceptual-knowledge/exercises/setExercises
    [HttpPost("conceptual-knowledge/exercises/setExercises")]
    public IActionResult SetEqualizationExercises()
    {
      try
      {
        _exerciseService.SetEqualizationExercises(EqualizationExamples.GetExamples());
        return Ok();
      }
      catch (Exception ex)
      {
        // log ex if you like
        return BadRequest(ex.Message);
      }
    }

    // GET /equalization/conceptual-knowledge/exercises/getExercises
    [HttpGet("conceptual-knowledge/exercises/getExercises")]
    public ActionResult<List<ExerciseResponse>> GetEqualizationExercises()
    {
      try
      {
        var list = _exerciseService.GetExercises(CKExerciseType.Equalization);
        return Ok(list);
      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }

    // GET /equalization/conceptual-knowledge/exercises/getExercise/{id}
    [HttpGet("conceptual-knowledge/exercises/getExercise/{id:long}")]
    public ActionResult<EqualizationExercise> GetEqualizationExercise(long id)
    {
      try
      {
        var ex = _exerciseService.GetEqualizationExerciseById(id);
        return ex is null ? NotFound() : Ok(ex);
      }
      catch (Exception exception)
      {
        return BadRequest(exception.Message);
      }
    }

    // GET /equalization/conceptual-knowledge/exercises/getExerciseForStudy/{id}
    [Authorize]
    [HttpGet("conceptual-knowledge/exercises/getExerciseForStudy/{id:long}")]
    public ActionResult<EqualizationExercise> GetEqualizationExerciseForStudy(long id)
      => GetEqualizationExercise(id);
  }
}
