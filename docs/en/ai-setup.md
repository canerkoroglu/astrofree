# AI connection guide

[Türkçe](../ai-setup.md)

AstroFree has no AI model of its own. Chat works by connecting to one of the options below. Pick whichever suits you;
in the app, **Settings → AI → Connection guide** shows the same steps.

| Option | What you need | Cost |
|---|---|---|
| 1. Claude Code | A Claude account (Pro/Max) + the `claude` command-line tool | Included in your subscription |
| 2. Codex | A ChatGPT account + the `codex` command-line tool | Included in your subscription |
| 3. API key | An Anthropic / OpenAI / Gemini / DeepSeek key | Billed per use by the provider |
| 4. Local model | Ollama, LM Studio, llama.cpp… | Free; needs a capable computer |

## 1. With a Claude subscription (Claude Code)

> **Important:** the Claude desktop app or claude.ai alone is **not enough**. AstroFree uses the **Claude Code**
> command-line tool (the `claude` command). It works with the same Claude account but is installed separately. If the
> desktop app is installed but Claude Code is not, AstroFree says so in the chat panel.

**Windows** — open PowerShell:

```powershell
irm https://claude.ai/install.ps1 | iex
```

**macOS / Linux** — open Terminal:

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

With Node.js installed, `npm install -g @anthropic-ai/claude-code` works on every system too.

Then, in a **new** terminal window, run `claude` once and sign in with your Claude account. Go back to AstroFree and
press **Check again** in the chat panel.

On Windows, Claude Code may also need Git for Windows (Git Bash); if the installer warns about it, install it from
[git-scm.com](https://git-scm.com).

## 2. With a ChatGPT account (Codex)

> The ChatGPT app alone is not enough: AstroFree uses **Codex CLI** (the `codex` command). If the ChatGPT app is
> installed but Codex is not, AstroFree says so in the chat panel.

```bash
npm install -g @openai/codex
codex login
```

## 3. With an API key

Get a key from the provider (console.anthropic.com, platform.openai.com, aistudio.google.com, platform.deepseek.com)
and enter it for that provider under **Settings → AI**. The key is encrypted with your operating system's keychain and
stored only on your computer.

- **The API is separate from subscriptions.** A Claude Pro or ChatGPT Plus subscription does not cover API usage; the
  provider's developer console needs its own payment method or credit.
- After entering the key, press **Test key**. It fetches the model list without spending any tokens and tells you
  what is wrong, if anything:

| Message | Meaning |
|---|---|
| The API key is not valid | Copied wrongly, deleted, or from another provider |
| The account has no credit or quota | No payment method/credit added (DeepSeek, OpenAI, Anthropic) |
| You hit a rate limit | Too many requests or the free-tier quota is used up; wait a little |
| Does not serve your country | The provider does not support your region; use another provider or a local model |
| Could not reach … / secure connection | No internet, or a company network (proxy, firewall) is blocking it |

## 4. Local model

Install [Ollama](https://ollama.com) and download a model:

```bash
ollama pull qwen3:8b
```

Under **Settings → AI → Local server**, pick the server type and press **Test connection**. LM Studio, llama.cpp,
LiteLLM, vLLM or any other OpenAI-compatible server connects the same way by entering its address and port.

- **"Could not connect to the server"**: the server is not running. Open Ollama; in LM Studio start the server from
  the Developer tab; for llama.cpp, `llama-server` must be running.
- **Server on another computer:** allow network access there (Ollama: `OLLAMA_HOST=0.0.0.0`), open the port in its
  firewall and enter that computer's IP address in AstroFree.
- **HTTP 404**: the address does not end in `/v1` or the model name is wrong; **Test connection** lists the right names.

## It says "not found" although I installed it

1. **Quit AstroFree completely and open it again.** On Windows, newly installed commands may not be visible to programs
   that are already open. AstroFree re-reads the current PATH on every "Check again", but restart to be sure.
2. **Find where the command is** and paste the path into **Settings → AI → Claude Code (or Codex) → Command / path**:
   - Windows (PowerShell): `where.exe claude codex`
   - macOS / Linux: `which claude codex`
3. **WSL on Windows:** if you installed Claude Code inside WSL (Ubuntu etc.), Windows programs cannot see it; install it
   on Windows as well.
4. **The command is found but no answer comes:** make sure you have run `claude` once in a terminal and signed in.
5. **Work computer:** security software or a proxy may block the command; try the API key or local model option.

Places AstroFree checks automatically: PATH, `%USERPROFILE%\.local\bin` (Claude Code installer), `%APPDATA%\npm`,
WinGet, Scoop, pnpm, Volta, nvm; on macOS/Linux also Homebrew, `~/.local/bin`, `~/.npm-global/bin`, `~/.bun/bin`.

Still stuck: [GitHub Issues](https://github.com/canerkoroglu/astrofree/issues) · astrofree@cklabs.tr
