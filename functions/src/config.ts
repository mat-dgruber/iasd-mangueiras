import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  appName: process.env.APP_NAME || 'IASD Mangueiras API',
  appEnv: process.env.APP_ENV || 'development',
  corsOrigins: [
    'https://iasdmangueiras.org.br',
    'https://iasd-mangueiras-web.web.app',
    'https://iasd-mangueiras-web.firebaseapp.com',
    'http://localhost:4200',
    'http://localhost:4000',
    'http://127.0.0.1:4200',
    'http://127.0.0.1:4000',
  ],
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY || '',
    channelId: process.env.YOUTUBE_CHANNEL_ID || 'UC4x7BBBm6Ds1JZYit0yMhuQ',
    cacheTtlSeconds: Number(process.env.YOUTUBE_CACHE_TTL_SECONDS) || 1800,
    playlists: {
      presente7: process.env.YOUTUBE_PRESENTE7_PLAYLIST_ID || 'PLNgTlCgGyS2GLFNcIWz1_CuCYJOhWOe28',
      sabado: process.env.YOUTUBE_SABADO_PLAYLIST_ID || 'PLNgTlCgGyS2GD4T7wfkl7H8a8PCOjBCQU',
      domingo: process.env.YOUTUBE_DOMINGO_PLAYLIST_ID || 'PLNgTlCgGyS2FF1Q6uHqZkNKLwij1xKO2T',
      quarta: process.env.YOUTUBE_QUARTA_PLAYLIST_ID || 'PLNgTlCgGyS2GRDfZ364omUABt5_2sUoTY',
    },
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || '',
  },
};
