using System.Security.Claims;
using BCrypt.Net;
using FinanceiroInteligenteReal.Data;
using FinanceiroInteligenteReal.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;

namespace FinanceiroInteligenteReal.Controllers;

public class AuthController : Controller
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult Register()
    {
        return View();
    }

    [HttpPost]
    public IActionResult Register(RegisterViewModel model)
    {
        if (_context.Usuarios.Any(x => x.Email == model.Email))
        {
            ViewBag.Erro = "E-mail já cadastrado";
            return View();
        }

        var codigo = Random.Shared
            .Next(100000, 999999)
            .ToString();

        var usuario = new Usuario
        {
            Nome = model.Nome,
            Email = model.Email,
            SenhaHash = BCrypt.Net.BCrypt.HashPassword(model.Senha),

            CodigoConfirmacao = codigo,
            ExpiracaoCodigo = DateTime.Now.AddMinutes(15),
            EmailConfirmado = false
        };

        _context.Usuarios.Add(usuario);
        _context.SaveChanges();

        return RedirectToAction(
            "ConfirmarEmail",
            new { email = usuario.Email });
    }

    [HttpGet]
    public IActionResult Login()
    {
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> Login(LoginViewModel model)
    {
        var usuario = _context.Usuarios
            .FirstOrDefault(x => x.Email == model.Email);

        if (usuario == null)
        {
            ViewBag.Erro = "Usuário não encontrado";
            return View();
        }

        if (!usuario.EmailConfirmado)
        {
            ViewBag.Erro = "Confirme seu e-mail antes de entrar.";
            return View();
        }

        if (!BCrypt.Net.BCrypt.Verify(
            model.Senha,
            usuario.SenhaHash))
        {
            ViewBag.Erro = "Senha inválida";
            return View();
        }

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new Claim(ClaimTypes.Name, usuario.Nome),
            new Claim(ClaimTypes.Email, usuario.Email)
        };

        var identity = new ClaimsIdentity(
            claims,
            CookieAuthenticationDefaults.AuthenticationScheme);

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(identity));

        return RedirectToAction("Index", "Home");
    }

    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync();

        return RedirectToAction("Login");
    }

    [HttpGet]
    public IActionResult ConfirmarEmail(string email)
    {
        return View(
            new ConfirmarEmailViewModel
            {
                Email = email
            });
    }

    [HttpPost]
    public IActionResult ConfirmarEmail(
        ConfirmarEmailViewModel model)
    {
        var usuario = _context.Usuarios
            .FirstOrDefault(x =>
                x.Email == model.Email);

        if (usuario == null)
            return View(model);

        if (usuario.ExpiracaoCodigo < DateTime.Now)
        {
            ViewBag.Erro = "Código expirado.";
            return View(model);
        }

        if (usuario.CodigoConfirmacao != model.Codigo)
        {
            ViewBag.Erro = "Código inválido";
            return View(model);
        }

        usuario.EmailConfirmado = true;
        usuario.CodigoConfirmacao = null;

        _context.SaveChanges();

        return RedirectToAction("Login");
    }
}