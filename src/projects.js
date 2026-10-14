// Lista de projetos da página inicial (faixa "Projetos recentes" e página #projetos).
// Os projetos com página própria vêm de src/projects/*.json (gerado no build em _gen/projects.json):
// ficam com ligação quando existem imagens em src/img/<slug>/; senão aparecem como "Em breve".
// Os lugares reservados abaixo (Websites) podem ser apagados quando houver projetos reais.
import PJ from './_gen/projects.json';

export const BADGE = 'Portfólio da fundadora';

export const P = [
  ...PJ.map(p => p.cover
    ? {cat: p.cat, title: p.title, href: p.slug + '/', img: p.cover, pos: p.pos}
    : {cat: p.cat, title: p.title, soon: 1}),
  {cat: 'Websites', title: 'Novo projeto', soon: 1},
  {cat: 'Websites', title: 'Novo projeto', soon: 1},
];

export const CATS = ['Branding', 'Websites', 'Email marketing'].filter(c => P.some(p => p.cat === c));
