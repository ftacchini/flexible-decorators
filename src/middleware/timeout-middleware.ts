import { injectable } from 'tsyringe';
import { TimeoutService, ContextBinnacle, FullEvent, FlexibleEvent } from 'flexible-core';
import { Param } from '../decorators/parameter';

/**
 * Decorator-compatible middleware wrapper for TimeoutService.
 *
 * This middleware works with @BeforeExecution by using @Param decorators
 * to extract contextBinnacle and event, then delegating to TimeoutService.
 *
 * @example
 * ```typescript
 * @Controller()
 * export class ApiController {
 *     @BeforeExecution(TimeoutMiddleware, 'processEvent', { singleton: true })
 *     @Route(HttpGet)
 *     public async getData() {
 *         return { data: 'Hello' };
 *     }
 * }
 * ```
 */
@injectable()
export class TimeoutMiddleware {
    constructor(
        private timeoutService: TimeoutService
    ) {}

    /**
     * Processes an event by delegating to TimeoutService.
     *
     * @param contextBinnacle - Extracted via @Param(ContextBinnacle)
     * @param event - Extracted via @Param(FullEvent)
     */
    public async processEvent(
        @Param(ContextBinnacle) contextBinnacle: { [key: string]: any },
        @Param(FullEvent) event?: FlexibleEvent
    ): Promise<void> {
        await this.timeoutService.processEvent(contextBinnacle, event);
    }
}
