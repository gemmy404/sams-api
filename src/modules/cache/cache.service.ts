import {Inject, Injectable} from '@nestjs/common';
import type {Cache} from 'cache-manager';
import {CACHE_MANAGER} from "@nestjs/cache-manager";

@Injectable()
export class CacheService {

    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    }

    async createItem(cacheKey: string, item: any, ttl?: number) {
        return this.cacheManager.set(cacheKey, item, ttl)
    }

    async findItemByCacheKey(cacheKey: string) {
        return this.cacheManager.get(cacheKey);
    }

    async deleteItemByCacheKey(cacheKey: string) {
        return this.cacheManager.del(cacheKey);
    }

    async clearCache() {
        return this.cacheManager.clear();
    }
}
