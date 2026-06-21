using FinanceiroInteligenteReal.DTOs;

namespace FinanceiroInteligenteReal.Services;

public interface IImportacaoService
{
    Task<ImportacaoResponse> ImportarAsync(IFormFile arquivo);
}