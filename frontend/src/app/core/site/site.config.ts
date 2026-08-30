export const SITE_CONFIG = {
  name: 'IASD Mangueiras',
  legalName: 'Igreja Adventista do Sétimo Dia das Mangueiras',
  city: 'Tatuí',
  state: 'SP',
  locale: 'pt_BR',
  siteUrl: 'https://iasdmangueiras.org.br',
  description: 'Site oficial da Igreja Adventista do Sétimo Dia das Mangueiras em Tatuí-SP.',
  address: {
    street: 'Av. Cônego João Clímaco, 195 - Centro',
    locality: 'Tatuí',
    region: 'SP',
    country: 'BR',
  },
  primaryCta: {
    label: 'Como chegar',
    href: '/horarios',
  },
  social: {
    facebook: 'https://www.facebook.com/igrejadasmangueiras/?locale=pt_BR',
    instagram: 'https://www.instagram.com/iasdmangueiras/',
    youtube: 'https://www.youtube.com/c/IASDMangueiras',
    whatsapp: 'https://api.whatsapp.com/send?phone=5515999999999&text=Ol%C3%A1!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20a%20IASD%20Mangueiras.',
  },
  playlists: {
    presente7: 'https://youtube.com/playlist?list=PLNgTlCgGyS2GLFNcIWz1_CuCYJOhWOe28',
    cultosSabado: 'https://youtube.com/playlist?list=PLNgTlCgGyS2GD4T7wfkl7H8a8PCOjBCQU',
    cultosDomingo: 'https://youtube.com/playlist?list=PLNgTlCgGyS2FF1Q6uHqZkNKLwij1xKO2T',
    cultosQuarta: 'https://youtube.com/playlist?list=PLNgTlCgGyS2GRDfZ364omUABt5_2sUoTY',
  },
  resources: {
    seteme: 'https://7me.adventistas.org/',
    cpbMais: 'https://mais.cpb.com.br/',
    licaoAdultos: 'https://mais.cpb.com.br/licao-da-escola-sabatina/',
    bibliaOnline: 'https://www.bibliaonline.com.br/',
  },
} as const;
