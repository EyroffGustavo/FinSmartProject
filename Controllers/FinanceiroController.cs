using FinanceiroInteligenteReal.Data;
using FinanceiroInteligenteReal.Helpers;
using FinanceiroInteligenteReal.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanceiroInteligenteReal.Controllers;

[Authorize]
[ApiController]
[Route("api/financeiro")]
public class FinanceiroController : ControllerBase
{
    private readonly AppDbContext _context;

    public FinanceiroController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var usuarioId = UserHelper.GetUsuarioId(User);

        var receitas = await _context.Receitas
            .Where(x => x.UsuarioId == usuarioId)
            .ToListAsync();

        var despesas = await _context.Despesas
            .Where(x => x.UsuarioId == usuarioId)
            .ToListAsync();

        return Ok(new
        {
            receitas,
            despesas,
            totalReceitas = receitas.Sum(x => x.Valor),
            totalDespesas = despesas.Sum(x => x.Valor),
            saldo = receitas.Sum(x => x.Valor) - despesas.Sum(x => x.Valor)
        });
    }

    [HttpPost("receitas")]
    public async Task<IActionResult> CriarReceita([FromBody] Receita receita)
    {
        receita.UsuarioId = UserHelper.GetUsuarioId(User);

        _context.Receitas.Add(receita);
        await _context.SaveChangesAsync();

        return Ok(receita);
    }

    [HttpPost("despesas")]
    public async Task<IActionResult> CriarDespesa([FromBody] Despesa despesa)
    {
        despesa.UsuarioId = UserHelper.GetUsuarioId(User);

        _context.Despesas.Add(despesa);
        await _context.SaveChangesAsync();

        return Ok(despesa);
    }

    [HttpDelete("receitas/{id}")]
    public async Task<IActionResult> RemoverReceita(int id)
    {
        var usuarioId = UserHelper.GetUsuarioId(User);

        var receita = await _context.Receitas
            .FirstOrDefaultAsync(x => x.Id == id && x.UsuarioId == usuarioId);

        if (receita == null)
            return NotFound();

        _context.Receitas.Remove(receita);
        await _context.SaveChangesAsync();

        return Ok();
    }

    [HttpDelete("despesas/{id}")]
    public async Task<IActionResult> RemoverDespesa(int id)
    {
        var usuarioId = UserHelper.GetUsuarioId(User);

        var despesa = await _context.Despesas
            .FirstOrDefaultAsync(x => x.Id == id && x.UsuarioId == usuarioId);

        if (despesa == null)
            return NotFound();

        _context.Despesas.Remove(despesa);
        await _context.SaveChangesAsync();

        return Ok();
    }
}