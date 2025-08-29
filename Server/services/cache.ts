import { Cache } from "memory-cache";

class Storage_Cache {
  cache: Cache<any, any> = null;
  constructor() {}

  getCache() {
    if (this.cache) {
      return this.cache;
    } else {
      this.cache = new Cache();
      return this.cache;
    }
  }

  cacheData(data: any, key: string, time = 300000) {
    if (!this.cache) {
      this.getCache();
    }

    this.cache.put(key, data, time);
  }
}

const cache = new Storage_Cache();
export default cache;
