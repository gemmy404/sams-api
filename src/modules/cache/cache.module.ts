import {Module} from '@nestjs/common';
import {CacheService} from './cache.service';
import {CacheModule as NestCacheModule} from "@nestjs/cache-manager";
import {ConfigService} from "@nestjs/config";
import {createKeyv} from "@keyv/redis";
import {CACHE_CONFIG} from "../../common/constants/cache.constant";

@Module({
    imports: [
        NestCacheModule.registerAsync({
            isGlobal: true,
            useFactory: (configService: ConfigService) => ({
                stores: [
                    createKeyv(
                        `redis://${configService.getOrThrow(CACHE_CONFIG.REDIS_HOST) ?? 'localhost'}:${configService.getOrThrow(CACHE_CONFIG.REDIS_PORT) ?? 6379}`
                    ),
                ],
                ttl: 600000,
            }),
            inject: [ConfigService]
        }),
    ],
    providers: [CacheService],
    exports: [CacheService],
})
export class CacheModule {
}
