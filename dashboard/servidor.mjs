// dashboard/servidor.mjs
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname, normalize, extname } from "node:path";
import { lerEstado } from "./leitura.mjs";

const ESTE_DIR = dirname(fileURLToPath(import.meta.url)); // pasta dashboard/
const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml" };

// só estes arquivos do front-end podem ser servidos (whitelist explícita)
const ESTATICOS = new Set(["index.html", "estilo.css", "painel.js"]);

export function criarServidor(raiz) {
  return createServer((req, res) => {
    try {
      const url = new URL(req.url, "http://127.0.0.1");
      if (req.method !== "GET") { res.writeHead(405).end("método não permitido"); return; }

      // pathname já vem decodificado pelo URL — qualquer %2e%2e/etc já virou ".."/"/".
      const pathname = decodeURIComponent(url.pathname);

      if (pathname === "/api/estado") {
        const estado = lerEstado(raiz);
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(estado));
        return;
      }

      // front-end estático — só nomes da whitelist, nunca caminho arbitrário.
      // Rejeita de cara qualquer tentativa de subir de pasta, separador suspeito ou NUL.
      if (pathname.includes("..") || pathname.includes("\0") || pathname.includes("\\")) {
        res.writeHead(404).end("não encontrado"); return;
      }
      let nome = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
      nome = normalize(nome).replace(/^(\.\.[/\\])+/, "");
      // a whitelist é a barreira dura: nome precisa ser EXATAMENTE um arquivo permitido,
      // sem subpasta nenhuma (normalize não pode ter introduzido separador).
      if (!ESTATICOS.has(nome) || nome.includes("/") || nome.includes("\\")) {
        res.writeHead(404).end("não encontrado"); return;
      }
      const caminho = normalize(join(ESTE_DIR, nome));
      // defesa em profundidade: o caminho resolvido tem que ficar DENTRO de dashboard/.
      if (!caminho.startsWith(ESTE_DIR) || !existsSync(caminho)) {
        res.writeHead(404).end("não encontrado"); return;
      }
      res.writeHead(200, { "Content-Type": MIME[extname(nome)] || "application/octet-stream" });
      res.end(readFileSync(caminho));
    } catch (e) {
      res.writeHead(500).end("erro interno");
    }
  });
}

// CLI: sobe o servidor lendo o repo a partir do diretório-pai da pasta dashboard/
if (import.meta.main) {
  const raiz = process.env.DASHBOARD_RAIZ || join(ESTE_DIR, "..");
  const porta = Number(process.env.DASHBOARD_PORT) || 5173;
  criarServidor(raiz).listen(porta, "127.0.0.1", () => {
    console.log(`Painel ImpulsoX-OS em http://127.0.0.1:${porta}`);
  });
}
