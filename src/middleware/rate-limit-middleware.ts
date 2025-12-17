import { injectable, inject } from 'tsyringe';
import { RateLimitService, RateLimitConfig, RateLimitStore, RATE_LIMIT_TYPES, FullEvent, FlexibleEvent } from 'flexible-core';
import { Param } from '../decorators/parameter';

/**
 * Decorator-compatible middleware wrapper for RateLimitService.
 *
 * Configuration is passed via the config property in @BeforeExecution decorator.
 * Store is injected from DI container.
 *
 * @example
 * ```typescript
 * @Controller()
 * export class ApiController {
 *     @BeforeExecution(RateLimitMiddleware, 'check', {
 *         singleton: true,
 *         config: { config: new RateLimitConfig({ max: 100, windowMs: 60000 }) }
 *     })
 *     @Route(HttpGet)
 *     public async getData() {
 *         return { data: 'Hello' };
 *     }
 * }
 * ```
 */
@injectable()
export class RateLimitMiddleware {
    private service?: RateLimitService;
    private store: RateLimitStore;

    // Config property set by decorator framework
    public config!: RateLimitConfig;

    constructor(
        @inject(RATE_LIMIT_TYPES.STORE) store?: RateLimitStore
    ) {
        this.store = store!;
    }

    public async check(@Param(FullEvent) event: FlexibleEvent): Promise<void> {
        // Lazy initialization after config is set by decorator framework
        if (!this.service) {
            if (!this.config) {
                throw new Error('RateLimitMiddleware: config is required');
            }
            this.service = new RateLimitService(this.config, this.store);
        }

        await this.service.check(event);
    }
}
