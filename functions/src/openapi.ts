// MARK: - OpenAPI 3.1 Specification

/**
 * Especificação canônica OpenAPI 3.1.0 da API Serverless IASD Mangueiras.
 * Consumida pelo Scalar em `/scalar` (ambientes não-produtivos) e exportada para `docs/api/openapi.json`.
 */
export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'IASD Mangueiras API',
    version: '1.0.0',
    description: 'API Serverless oficial da Igreja Adventista do Sétimo Dia das Mangueiras em Tatuí-SP.',
  },
  servers: [
    {
      url: '/api',
      description: 'API Base',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Verificar status da API',
        responses: {
          '200': {
            description: 'API em funcionamento',
          },
        },
      },
    },
    '/livez': {
      get: {
        summary: 'Liveness Probe',
        responses: {
          '200': {
            description: 'Processo ativo e respondendo',
          },
        },
      },
    },
    '/readyz': {
      get: {
        summary: 'Readiness Probe',
        responses: {
          '200': {
            description: 'Serviços externos e banco prontos',
          },
          '503': {
            description: 'Infraestrutura indisponível',
          },
        },
      },
    },
    '/api/youtube/latest': {
      get: {
        summary: 'Listar vídeos recentes do canal',
        responses: {
          '200': {
            description: 'Lista dos últimos vídeos e transmissões',
          },
        },
      },
    },
    '/api/youtube/live': {
      get: {
        summary: 'Verificar status de transmissão ao vivo',
        responses: {
          '200': {
            description: 'Status atual do culto ao vivo',
          },
        },
      },
    },
    '/api/contato': {
      post: {
        summary: 'Enviar mensagem de contato',
        responses: {
          '200': {
            description: 'Mensagem recebida com sucesso',
          },
          '422': {
            description: 'Campos obrigatórios ausentes',
          },
        },
      },
    },
    '/api/oracao': {
      post: {
        summary: 'Enviar pedido de oração',
        responses: {
          '200': {
            description: 'Pedido de oração recebido com sucesso',
          },
          '422': {
            description: 'Campos obrigatórios ausentes',
          },
        },
      },
    },
  },
};
