import { injectable } from 'tsyringe';
import { CancellationService, ContextBinnacle, FullEvent, FlexibleEvent } from 'flexible-core';
import { Param } from '../decorators/parameter';

/**
 * Decorator-compatible middleware wrapper for CancellationService.
 *
 * This middleware works with @BeforeExecution by using @Param decorators
 * to extract contextBinnacle and event, then delegating to CancellationService.
 *
 * @example
 * ```typescript
 * @Controller()
 * export class ApiController {
 *     @BeforeExecution(CancellationMiddleware, 'processEvent', { singleton: true })
 *     @Route(HttpGet)
 *     public async getData() {
 *         return { data: 'Hello' };
 *     }
 * }
 * ```
 */
@injectable()
export class CancellationMiddleware {
    constructor(
        private cancellationService: CancellationService
    ) {}

    /**
     * Processes an event by delegating to CancellationService.
     *
     * @param contextBinnacle - Extracted via @Param(ContextBinnacle)
     * @param event - Extracted via @Param(FullEvent)
     */
    public async processEvent(
        @Param(ContextBinnacle) contextBinnacle: { [key: string]: any },
        @Param(FullEvent) event?: FlexibleEvent
    ): Promise<void> {
        await this.cancellationService.processEvent(contextBinnacle, event);
    }
}
