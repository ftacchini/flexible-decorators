import { injectable } from 'tsyringe';
import { RateLimitService, FullEvent, FlexibleEvent } from 'flexible-core';
import { Param } from '../decorators/parameter';

/**
 * Decorator-compatible middleware wrapper for RateLimitService.
 *
 * This middleware works with @BeforeExecution by using @Param decorator
 * to extract the event, then delegating to RateLimitService.
 *
 * @example
 * ```typescript
 * @Controller()
 * export class ApiController {
 *     @BeforeExecution(RateLimitMiddleware, 'check', { singleton: true })
 *     @Route(HttpGet)
 *     public async getData() {
 *         return { data: 'Hello' };
 *     }
 * }
 * ```
 */
@injectable()
export class RateLimitMiddleware {
    constructor(
        private rateLimitService: RateLimitService
    ) {}

    /**
     * Checks rate limit by delegating to RateLimitService.
     *
     * @param event - Extracted via @Param(FullEvent)
     */
    public async check(@Param(FullEvent) event: FlexibleEvent): Promise<void> {
        await this.rateLimitService.check(event);
    }
}
