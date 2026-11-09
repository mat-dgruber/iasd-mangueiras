// MARK: - Types & Contracts

/**
 * Representa uma entrada armazenada no cache em memória com timestamp de expiração.
 */
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

// MARK: - In-Memory Cache Service

/**
 * Cache em memória com expiração por TTL e suporte a deduplicação de requisições concorrentes (Single-Flight).
 */
class MemoryCache {
  private store = new Map<string, CacheEntry<any>>();
  private inflight = new Map<string, Promise<any>>();

  /**
   * Recupera um valor tipado do cache caso presente e não expirado.
   *
   * @param key - Chave única do item em cache.
   * @returns O valor armazenado ou `null` se ausente/expirado.
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  /**
   * Executa `loader` com proteção Single-Flight contra Cache Stampede: chamadas concorrentes
   * para a mesma chave compartilham a mesma Promise em voo.
   *
   * @param key - Chave única do recurso cacheado.
   * @param ttlSeconds - Tempo de vida do item em segundos após resolução.
   * @param loader - Função assíncrona produtora do valor em caso de cache miss.
   * @returns Promise resolvida com o valor do cache ou do `loader`.
   * @throws Propaga qualquer erro lançado por `loader` após limpar o registro em voo.
   */
  async singleflight<T>(key: string, ttlSeconds: number, loader: () => Promise<T>): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;
    const existing = this.inflight.get(key);
    if (existing) return existing as Promise<T>;
    const promise = loader()
      .then((res) => {
        this.set(key, res, ttlSeconds);
        this.inflight.delete(key);
        return res;
      })
      .catch((err) => {
        this.inflight.delete(key);
        throw err;
      });
    this.inflight.set(key, promise);
    return promise;
  }

  /**
   * Armazena um valor no cache em memória pelo TTL informado.
   *
   * @param key - Chave única do item.
   * @param data - Payload a ser armazenado.
   * @param ttlSeconds - Tempo de vida em segundos.
   */
  set<T>(key: string, data: T, ttlSeconds: number): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Remove todas as entradas ativas do cache em memória.
   */
  clear(): void {
    this.store.clear();
  }
}

export const memoryCache = new MemoryCache();
