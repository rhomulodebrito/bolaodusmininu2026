export type FifaMoment = {
  title: string;
  label: string;
  href: string;
  image: string;
};

const fallbackMoments: FifaMoment[] = [
  {
    title: "Momentos da Copa do Mundo da FIFA",
    label: "FIFA.com",
    href: "https://www.fifa.com/pt/tournaments/mens/worldcup",
    image: "https://upload.wikimedia.org/wikipedia/commons/3/36/2018_World_Cup_Final_-_France_v_Croatia.jpg",
  },
  {
    title: "Jogos e estatísticas oficiais",
    label: "Calendário e resultados",
    href: "https://www.fifa.com/pt/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures",
    image: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Lusail_Stadium.jpg",
  },
  {
    title: "Notícias da Copa",
    label: "FIFA.com",
    href: "https://www.fifa.com/pt/tournaments/mens/worldcup/canadamexicousa2026/articles",
    image: "https://upload.wikimedia.org/wikipedia/commons/8/87/Argentina_vs_France_2022_FIFA_World_Cup_Final.jpg",
  },
];

function imageFromHtml(html: string) {
  const candidates = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
  ];

  for (const pattern of candidates) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1].replace(/&amp;/g, "&");
  }

  return undefined;
}

export async function fetchFifaMoments() {
  const moments = await Promise.all(
    fallbackMoments.map(async (moment) => {
      try {
        const response = await fetch(moment.href, {
          headers: {
            "User-Agent": "Mozilla/5.0",
          },
        });

        if (!response.ok) return moment;
        const image = imageFromHtml(await response.text());
        return image ? { ...moment, image, label: "Imagem FIFA.com" } : moment;
      } catch {
        return moment;
      }
    }),
  );

  return moments;
}

export { fallbackMoments };
