using Microsoft.EntityFrameworkCore;
using FinanceiroInteligenteReal.Models;

namespace FinanceiroInteligenteReal.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(
        DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }
    public DbSet<Receita> Receitas { get; set; }
    public DbSet<Despesa> Despesas { get; set; }
    public DbSet<Divida> Dividas { get; set; }
    public DbSet<MetaFinanceira> Metas { get; set; }
    public DbSet<MovimentacaoImportada> Movimentacoes { get; set; }
    public DbSet<Usuario> Usuarios { get; set; }
}