const { addonBuilder } = require('stremio-addon-sdk');
const axios = require('axios');

const builder = new addonBuilder({
  id: 'org.superflix.stremio',
  version: '1.0.0',
  name: 'SuperFlix Addon',
  description: 'Add-on do Stremio para integrar conteúdo do SuperFlix',
  resources: ['catalog', 'stream'],
  types: ['movie', 'series'],
  catalogs: [
    {
      type: 'movie',
      id: 'superflix-movies',
      name: 'Filmes do SuperFlix'
    },
    {
      type: 'series',
      id: 'superflix-series',
      name: 'Séries do SuperFlix'
    }
  ]
});

// Função para buscar dados da API do SuperFlix
const fetchFromSuperFlix = async (endpoint) => {
  try {
    const response = await axios.get(`https://www.superflixapi.top/${endpoint}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar dados do SuperFlix: ${error}`);
    return [];
  }
};

// Define os handlers para os recursos
builder.defineCatalogHandler(async (args) => {
  let metas = [];
  if (args.type === 'movie' && args.id === 'superflix-movies') {
    const movies = await fetchFromSuperFlix('filmes');
    metas = movies.map((movie) => ({
      id: movie.id.toString(),
      type: 'movie',
      name: movie.title,
      poster: movie.poster,
      background: movie.background,
      description: movie.synopsis,
      releaseInfo: movie.year
    }));
  } else if (args.type === 'series' && args.id === 'superflix-series') {
    const series = await fetchFromSuperFlix('series');
    metas = series.map((serie) => ({
      id: serie.id.toString(),
      type: 'series',
      name: serie.title,
      poster: serie.poster,
      background: serie.background,
      description: serie.synopsis,
      releaseInfo: serie.year
    }));
  }
  return { metas };
});

builder.defineStreamHandler(async (args) => {
  const { type, id } = args;
  let streams = [];
  if (type === 'movie') {
    const movie = await fetchFromSuperFlix(`filmes/${id}`);
    streams = movie.streams.map((stream) => ({
      title: stream.name,
      url: stream.url
    }));
  } else if (type === 'series') {
    const serie = await fetchFromSuperFlix(`series/${id}`);
    streams = serie.episodes.map((episode) => ({
      title: `${episode.season}x${episode.number} - ${episode.title}`,
      url: episode.url
    }));
  }
  return { streams };
});

module.exports = builder.getInterface();
