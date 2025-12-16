import { injectable, inject } from 'tsyringe';
import { TimeoutService, TimeoutServiceConfig, ContextBinnacle, FullEvent, FlexibleEvent, FlexibleLogger, FLEXIBLE_APP_TYPES } from 'flexible-core';
import { Param } from '../decorators/parameter';

/**
 * Decorator-compatible middleware wrapper for TimeoutService.
 *
 * Configuration is passed via the config property in @BeforeExecution decorator.
 *
 * @example
 * ```typescript
 * @Controller()
 * export class ApiController {
 *     @BeforeExecution(TimeoutMiddleware, 'processEvent', {
 *         singleton: true,
 *         config: { timeout: 5000 }
 *     })
 *     @Route(HttpGet)
 *     public async getData() {
 *         return { data: 'Hello' };
 *     }
 * }
 * ```
 */
@injectable()
export class TimeoutMiddleware {
    private service?: TimeoutService;
    private logger: FlexibleLogger;

    // Config property set by decorator framework
    public config!: TimeoutServiceConfig;

    constructor(
        @inject(FLEXIBLE_APP_TYPES.LOGGER) logger: FlexibleLogger
    ) {
        this.logger = logger;
    }

    public async processEvent(
        @Param(ContextBinnacle) contextBinnacle: { [key: string]: any },
        @Param(FullEvent) event?: FlexibleEvent
    ): Promise<void> {
        // Lazy initialization after config is set by decorator framework
        if (!this.service) {
            if (!this.config) {
                throw new Error('TimeoutMiddleware: config is required');
            }
            this.service = new TimeoutService(this.config, this.logger);
        }

        await this.service.processEvent(contextBinnacle, event);
    }
}
