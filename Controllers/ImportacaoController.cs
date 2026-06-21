using Microsoft.AspNetCore.Mvc;
using FinanceiroInteligenteReal.Services;

namespace FinanceiroInteligenteReal.Controllers;

[ApiController]
[Route("api/importacao")]
public class ImportacaoController : ControllerBase
{
    private readonly IImportacaoService _service;

    public ImportacaoController(IImportacaoService service)
    {
        _service = service;
    }

    [HttpGet("teste")]
    public IActionResult Teste()
    {
        return Ok("API OK");
    }

    [HttpPost("arquivo")]
    public async Task<IActionResult> Importar(IFormFile arquivo)
    {
        Console.WriteLine("CHEGOU NO POST");
        return Ok("TESTE");

        try
        {
            Console.WriteLine("=================================");
            Console.WriteLine("ENTROU NO CONTROLLER");
            Console.WriteLine("=================================");

            if (arquivo == null)
            {
                Console.WriteLine("ARQUIVO NULO");
                return BadRequest("Arquivo não enviado.");
            }

            Console.WriteLine($"Nome: {arquivo.FileName}");
            Console.WriteLine($"Tamanho: {arquivo.Length}");

            var resultado = await _service.ImportarAsync(arquivo);

            Console.WriteLine("IMPORTAÇÃO FINALIZADA");

            return Ok(resultado);
        }
        catch (Exception ex)
        {
            Console.WriteLine("=================================");
            Console.WriteLine("ERRO NA IMPORTAÇÃO");
            Console.WriteLine(ex.ToString());
            Console.WriteLine("=================================");

            return StatusCode(500, ex.ToString());
        }
    }
}