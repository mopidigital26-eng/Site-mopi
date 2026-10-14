# Site Mopi Digital — projeto

## Estrutura
- `dist/`  → o site pronto a publicar (é isto que vai para o alojamento)
- `src/`   → código-fonte (HTML, CSS crítico e diferido, módulos JS)
- `seo/`   → robots.txt, sitemap.xml e llms.txt (copiados para `dist/` no build)
- `build.mjs` → script de compilação

## Alterar e voltar a compilar
1. Instalar o Node.js (v18 ou superior).
2. Na pasta do projeto: `npm install` (só da primeira vez) e depois `npm run build`.
3. O resultado fica em `dist/`.

Onde mexer: texto e secções em `src/template.html`; cores e estilos em `src/critical.css`
(topo da página) e `src/rest.css` (resto); projetos de exemplo em `src/main.js` (lista `P`);
animações em `src/motion.js`; fundo de partículas em `src/gl.js`.

## Publicar no GitHub Pages
1. Criar um repositório e enviar para a raiz **o conteúdo da pasta `dist/`** (não a pasta em si).
2. Settings → Pages → Deploy from a branch → `main` / `(root)`.
3. Em "Custom domain" indicar `mopidigital.pt` e, no domínios.pt, apontar o DNS conforme o GitHub indicar.
4. Depois de publicado, testar o formulário e submeter o `sitemap.xml` no Google Search Console e no Bing Webmaster Tools.

## CDN (Cloudflare, gratuita) — passo a passo
O GitHub Pages já distribui os ficheiros por uma CDN, mas com cache fixa de 10 minutos.
Com a Cloudflare à frente consegues cache longa, Brotli e HTTP/3:
1. Criar conta em cloudflare.com e "Add a site" → `mopidigital.pt` (plano Free).
2. No domínios.pt, trocar os nameservers pelos dois que a Cloudflare indicar.
3. Na Cloudflare, DNS: registos do GitHub Pages com a nuvem laranja (Proxied) ligada.
4. SSL/TLS → modo "Full"; ativar "Always Use HTTPS".
5. Speed → Optimization: ativar Brotli e HTTP/3. (Não ativar "Auto Minify" nem "Rocket Loader": o site já vem minificado e o Rocket Loader pode estragar os módulos JS.)
6. Caching → Cache Rules: para o caminho que começa por `/assets/` usar "Eligible for cache" com Edge TTL e Browser TTL de 1 ano
   (os ficheiros têm hash no nome, por isso é seguro). Para `/` e `/index.html`, deixar o padrão.
Se em vez do GitHub usares Cloudflare Pages ou Netlify, o ficheiro `_headers` já define estas regras de cache.

## Imagens e projetos
Cada projeto tem uma página própria (fora do menu) e uma miniatura em "Projetos". Para acrescentar ou alterar:
1. Colocar as imagens em `src/img/<slug>/` (PNG, JPG ou WebP). São ordenadas pelo nome do ficheiro (01-..., 02-...).
   A primeira é a miniatura; se existir um ficheiro `cover.jpg`/`cover.png`, esse é só a miniatura.
2. Criar/editar `src/projects/<slug>.json` (título, categoria, textos, `examples` com o texto alternativo e legenda de cada imagem).
   Copiar um dos existentes como modelo. Categorias das miniaturas: Branding, Websites, Email marketing.
3. `npm run build`. As imagens são convertidas para WebP (480/960/1600 px, qualidade 80) com lazy loading,
   a página entra no sitemap.xml e no llms.txt, e fica indexável. Sem imagens, a página fica `noindex` e a miniatura "Em breve".

Projetos atuais: email-marketing, zembe-manual-de-marca, zembe-energy-brand-kit, banners-digitais.
Os lugares reservados "Novo projeto / Em breve" (Websites) estão em `src/projects.js`; apagar quando houver projetos reais.
Para mostrar mais páginas dos manuais de marca, basta juntar mais imagens à pasta respetiva e voltar a compilar.
