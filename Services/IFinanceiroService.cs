using FinanceiroInteligenteReal.DTOs;

namespace FinanceiroInteligenteReal.Services;

public interface IFinanceiroService
{
    DiagnosticoResponse GerarDiagnostico(DiagnosticoRequest request);
    PlanejamentoResponse SimularPlanejamento(PlanejamentoRequest request);
}