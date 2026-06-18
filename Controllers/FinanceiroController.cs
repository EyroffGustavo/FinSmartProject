using FinanceiroInteligenteReal.DTOs;
using FinanceiroInteligenteReal.Services;
using Microsoft.AspNetCore.Mvc;

namespace FinanceiroInteligenteReal.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FinanceiroController : ControllerBase
{
    private readonly IFinanceiroService _financeiroService;

    public FinanceiroController(IFinanceiroService financeiroService)
    {
        _financeiroService = financeiroService;
    }

    [HttpPost("diagnostico")]
    public IActionResult GerarDiagnostico([FromBody] DiagnosticoRequest request)
    {
        try
        {
            var resultado = _financeiroService.GerarDiagnostico(request);
            return Ok(resultado);
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                erro = "Não foi possível gerar o diagnóstico financeiro.",
                detalhe = ex.Message
            });
        }
    }

    [HttpPost("planejamento")]
    public IActionResult SimularPlanejamento([FromBody] PlanejamentoRequest request)
    {
        try
        {
            var resultado = _financeiroService.SimularPlanejamento(request);
            return Ok(resultado);
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                erro = "Não foi possível simular o planejamento.",
                detalhe = ex.Message
            });
        }
    }
}