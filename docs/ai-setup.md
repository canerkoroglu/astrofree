# Yapay zekâ bağlantı rehberi

[English](en/ai-setup.md)

AstroFree'de kendi yapay zekâ modeli yoktur. Sohbet, aşağıdakilerden birine bağlanarak çalışır. Size uyan yolu seçin;
uygulamada **Ayarlar → Yapay zekâ → Bağlantı rehberi** aynı adımları gösterir.

| Yol | Ne gerekir | Ücret |
|---|---|---|
| 1. Claude Code | Claude hesabı (Pro/Max) + `claude` komut satırı aracı | Aboneliğinize dahil |
| 2. Codex | ChatGPT hesabı + `codex` komut satırı aracı | Aboneliğinize dahil |
| 3. API anahtarı | Anthropic / OpenAI / Gemini / DeepSeek anahtarı | Sağlayıcı kullanım başına faturalar |
| 4. Yerel model | Ollama, LM Studio, llama.cpp… | Ücretsiz, güçlü bilgisayar gerekir |

## 1. Claude aboneliğiyle (Claude Code)

> **Önemli:** Claude masaüstü uygulaması ya da claude.ai tek başına **yetmez**. AstroFree, **Claude Code** adlı komut
> satırı aracını (`claude` komutu) kullanır. Aynı Claude hesabıyla çalışır ama ayrıca kurulur. Masaüstü uygulaması
> kurulu, Claude Code kurulu değilse AstroFree bunu sohbet panelinde söyler.

**Windows** — PowerShell'i açın:

```powershell
irm https://claude.ai/install.ps1 | iex
```

**macOS / Linux** — Terminal'i açın:

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Node.js kuruluysa her sistemde `npm install -g @anthropic-ai/claude-code` da olur.

Ardından **yeni** bir terminal penceresinde bir kez `claude` yazıp Claude hesabınızla giriş yapın. AstroFree'ye dönüp
sohbet panelinde **Tekrar kontrol et**'e basın.

Windows'ta Claude Code, Git for Windows (Git Bash) da isteyebilir; kurulum uyarı verirse [git-scm.com](https://git-scm.com)
adresinden kurun.

## 2. ChatGPT hesabıyla (Codex)

```bash
npm install -g @openai/codex
codex login
```

## 3. API anahtarıyla

Sağlayıcının sitesinden bir anahtar alın (console.anthropic.com, platform.openai.com, aistudio.google.com,
platform.deepseek.com) ve **Ayarlar → Yapay zekâ** bölümünde ilgili sağlayıcıya girin. Anahtar, işletim sisteminin
anahtar zinciriyle şifrelenip yalnızca bilgisayarınızda saklanır.

## 4. Yerel model

[Ollama](https://ollama.com)'yı kurun ve bir model indirin:

```bash
ollama pull qwen3:8b
```

**Ayarlar → Yapay zekâ → Yerel sunucu** bölümünde sunucu türünü seçip **Bağlantıyı test et**'e basın. LM Studio,
llama.cpp, LiteLLM, vLLM ya da OpenAI uyumlu başka bir sunucu da aynı yerden adres ve port girilerek bağlanır.

## Kurduğum halde "bulunamadı" diyor

1. **AstroFree'yi tamamen kapatıp yeniden açın.** Windows'ta yeni kurulan komutlar, açık programlara hemen görünmeyebilir.
   AstroFree her "Tekrar kontrol et"te güncel PATH'i yeniden okur, ama emin olmak için yeniden başlatın.
2. **Komutun yerini bulun** ve çıkan yolu **Ayarlar → Yapay zekâ → Claude Code → Komut / yol** alanına yapıştırın:
   - Windows (PowerShell): `where.exe claude`
   - macOS / Linux: `which claude`
3. **Windows'ta WSL:** Claude Code'u WSL (Ubuntu vb.) içine kurduysanız Windows programları onu göremez; Windows'a ayrıca kurun.
4. **Komut bulunuyor ama yanıt gelmiyor:** terminalde bir kez `claude` çalıştırıp giriş yaptığınızdan emin olun.
5. **Şirket bilgisayarı:** güvenlik yazılımı ya da proxy komutu engelliyor olabilir; API anahtarı ya da yerel model yolunu deneyin.

AstroFree'nin otomatik baktığı yerler: PATH, `%USERPROFILE%\.local\bin` (Claude Code kurucusu), `%APPDATA%\npm`,
WinGet, Scoop, pnpm, Volta, nvm; macOS/Linux'ta ayrıca Homebrew, `~/.local/bin`, `~/.npm-global/bin`, `~/.bun/bin`.

Sorun sürerse: [GitHub Issues](https://github.com/canerkoroglu/astrofree/issues) · astrofree@cklabs.tr
