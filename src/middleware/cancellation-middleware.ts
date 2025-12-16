import { injectable, inject } from 'tsyringe';
import { CancellationService, ContextBinnacle, FullEvent, FlexibleEvent, FlexibleLogger, FLEXIBLE_APP_TYPES } from 'flexible-core';
import { Param } from '../decorators/parameter';

/**
 * Decorator-compatible middleware wrapper for CancellationService.
 *
 * This middleware doesn't require configuration.
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
    private service: CancellationService;

    constructor(
        @inject(FLEXIBLE_APP_TYPES.LOGGER) logger: FlexibleLogger
    ) {
        this.service = new CancellationService(logger);
    }

    public async processEvent(
        @Param(ContextBinnacle) contextBinnacle: { [key: string]: any },
        @Param(FullEvent) event?: FlexibleEvent
    ): Promise<void> {
        await this.service.processEvent(contextBinnacle, event);
    }
}
