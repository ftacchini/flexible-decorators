# Flexible Decorators

[![npm version](https://badge.fury.io/js/flexible-decorators.svg)](https://www.npmjs.com/package/flexible-decorators)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Decorator-based framework for [flexible-core](https://github.com/ftacchini/flexible-core) that provides controller and middleware decorators with TSyringe dependency injection.

## Installation

```bash
npm install flexible-decorators flexible-core flexible-http
```

## Quick Start

```typescript
import "reflect-metadata";
import { FlexibleApp } from "flexible-core";
import { DecoratorsFrameworkModule, ExplicitControllerLoader } from "flexible-decorators";
import { HttpModule } from "flexible-http";
import { injectable, inject } from "tsyringe";

@injectable()
@Controller()
export class HelloController {
    @Route(HttpGet)
    public world(): any {
        return { message: "Hello, World!" };
    }
}

const app = FlexibleApp.builder()
    .addEventSource(HttpModule.builder().withPort(3000).build())
    .addFramework(DecoratorsFrameworkModule.builder()
        .withControllerLoader(new ExplicitControllerLoader([HelloController]))
        .build())
    .createApp();

app.run();
```

## Features

- 🎯 **Decorator-based Controllers** - Clean, intuitive controller syntax
- 💉 **TSyringe Integration** - Full dependency injection support
- 🔀 **Flexible Routing** - Route decorators with parameter extraction
- 🛡️ **Middleware Support** - Before/after execution middleware
- 📦 **Modular Loading** - Explicit or path-based controller loading
- 🧪 **Testable** - Built-in test utilities

## Core Decorators

### @Controller

Marks a class as a controller:

```typescript
import { injectable } from "tsyringe";

@injectable()
@Controller()
export class UserController {
    // Controller methods here
}
```

**Important:** Always use `@injectable()` from TSyringe on controllers for proper dependency injection.

### @Route

Defines route handlers with filters:

```typescript
import { HttpGet, HttpPost } from "flexible-http";

@injectable()
@Controller()
export class UserController {
    @Route(HttpGet)
    public getUsers(): User[] {
        return this.userService.getAllUsers();
    }

    @Route(HttpPost)
    public createUser(@FromBody() user: User): User {
        return this.userService.createUser(user);
    }
}
```

### Parameter Decorators

Extract data from requests:

```typescript
import { FromPath, FromQuery, FromBody, FromHeaders } from "flexible-decorators";

@injectable()
@Controller()
export class UserController {
    @Route(HttpGet)
    public getUser(@FromPath("id") id: string): User {
        return this.userService.getUser(id);
    }

    @Route(HttpGet)
    public searchUsers(@FromQuery("name") name: string): User[] {
        return this.userService.searchByName(name);
    }

    @Route(HttpPost)
    public createUser(@FromBody() user: User): User {
        return this.userService.createUser(user);
    }

    @Route(HttpGet)
    public getUserWithAuth(@FromHeaders("authorization") auth: string): User {
        // Handle authentication
        return this.userService.getAuthenticatedUser(auth);
    }
}
```

## Dependency Injection with TSyringe

### Basic Injection

```typescript
import { inject, injectable } from "tsyringe";
import { FlexibleLogger, FLEXIBLE_APP_TYPES } from "flexible-core";

@injectable()
@Controller()
export class UserController {
    constructor(
        @inject(FLEXIBLE_APP_TYPES.LOGGER) private logger: FlexibleLogger,
        @inject(UserService.TYPE) private userService: UserService
    ) {}

    @Route(HttpGet)
    public getUsers(): User[] {
        this.logger.info("Getting all users");
        return this.userService.getAllUsers();
    }
}
```

### Service Registration

Register services in your container:

```typescript
import { FlexibleContainer } from "flexible-core";

// Create container and register services
const container = new FlexibleContainer();
container.registerClass(UserService.TYPE, UserService);
container.registerClass(EmailService.TYPE, EmailService);

// Use container in app
const app = FlexibleApp.builder()
    .withContainer(container)
    .addEventSource(httpModule)
    .addFramework(decoratorsFramework)
    .createApp();
```

### Service Definition

```typescript
import { injectable, inject } from "tsyringe";

@injectable()
export class UserService {
    static readonly TYPE = Symbol("UserService");

    constructor(
        @inject(EmailService.TYPE) private emailService: EmailService,
        @inject(FLEXIBLE_APP_TYPES.LOGGER) private logger: FlexibleLogger
    ) {}

    public createUser(userData: CreateUserRequest): User {
        this.logger.info("Creating user", { email: userData.email });

        const user = new User(userData);
        this.emailService.sendWelcomeEmail(user.email);

        return user;
    }
}
```

## Middleware

### Before Execution Middleware

```typescript
import { BeforeExecution } from "flexible-decorators";

@injectable()
@Controller()
export class UserController {
    @BeforeExecution(AuthenticationMiddleware)
    @Route(HttpGet)
    public getProtectedData(): any {
        return { data: "secret" };
    }
}

@injectable()
export class AuthenticationMiddleware {
    public execute(event: any, context: any): any {
        // Authentication logic
        if (!event.headers.authorization) {
            throw new Error("Unauthorized");
        }
        return event;
    }
}
```

### After Execution Middleware

```typescript
import { AfterExecution } from "flexible-decorators";

@injectable()
@Controller()
export class UserController {
    @AfterExecution(LoggingMiddleware)
    @Route(HttpPost)
    public createUser(@FromBody() user: User): User {
        return this.userService.createUser(user);
    }
}

@injectable()
export class LoggingMiddleware {
    constructor(@inject(FLEXIBLE_APP_TYPES.LOGGER) private logger: FlexibleLogger) {}

    public execute(response: any, event: any, context: any): any {
        this.logger.info("Request completed", {
            method: event.method,
            path: event.path,
            statusCode: response.statusCode
        });
        return response;
    }
}
```

## Controller Loading

### Explicit Controller Loading

Load specific controllers:

```typescript
import { ExplicitControllerLoader } from "flexible-decorators";

const framework = DecoratorsFrameworkModule.builder()
    .withControllerLoader(new ExplicitControllerLoader([
        UserController,
        ProductController,
        OrderController
    ]))
    .build();
```

### Path-based Controller Loading

Load controllers from a directory:

```typescript
import { PathControllerLoader } from "flexible-decorators";

const framework = DecoratorsFrameworkModule.builder()
    .withControllerLoader(new PathControllerLoader({
        path: "./src/controllers",
        pattern: "**/*-controller.ts"
    }))
    .build();
```

## Advanced Examples

### RESTful API Controller

```typescript
import { injectable, inject } from "tsyringe";
import { HttpGet, HttpPost, HttpPut, HttpDelete } from "flexible-http";

@injectable()
@Controller()
export class UserController {
    constructor(
        @inject(UserService.TYPE) private userService: UserService,
        @inject(FLEXIBLE_APP_TYPES.LOGGER) private logger: FlexibleLogger
    ) {}

    @Route(HttpGet)
    public getUsers(@FromQuery("page") page: string = "1"): User[] {
        const pageNum = parseInt(page, 10);
        this.logger.info("Getting users", { page: pageNum });
        return this.userService.getUsers(pageNum);
    }

    @Route(HttpGet)
    public getUser(@FromPath("id") id: string): User {
        this.logger.info("Getting user", { id });
        return this.userService.getUser(id);
    }

    @BeforeExecution(ValidationMiddleware)
    @Route(HttpPost)
    public createUser(@FromBody() userData: CreateUserRequest): User {
        this.logger.info("Creating user", { email: userData.email });
        return this.userService.createUser(userData);
    }

    @BeforeExecution(ValidationMiddleware)
    @Route(HttpPut)
    public updateUser(
        @FromPath("id") id: string,
        @FromBody() userData: UpdateUserRequest
    ): User {
        this.logger.info("Updating user", { id });
        return this.userService.updateUser(id, userData);
    }

    @Route(HttpDelete)
    public deleteUser(@FromPath("id") id: string): void {
        this.logger.info("Deleting user", { id });
        this.userService.deleteUser(id);
    }
}
```

### Multi-layer Architecture with Child Containers

```typescript
import { FlexibleContainer, DelegateEventSource } from "flexible-core";

// Main container with shared services
const mainContainer = new FlexibleContainer();
mainContainer.registerClass(UserService.TYPE, UserService);
mainContainer.registerValue(FLEXIBLE_APP_TYPES.LOGGER, logger);

// Security layer
const securityContainer = mainContainer.createChild();
const businessEventSource = new DelegateEventSource();
securityContainer.registerValue("NextLayer", businessEventSource);

const securityFramework = DecoratorsFrameworkModule.builder()
    .withControllerLoader(new ExplicitControllerLoader([SecurityController]))
    .build();

const securityApp = FlexibleApp.builder()
    .withContainer(securityContainer)
    .addEventSource(httpModule)
    .addFramework(securityFramework)
    .createApp();

// Business layer
const businessContainer = mainContainer.createChild();

const businessFramework = DecoratorsFrameworkModule.builder()
    .withControllerLoader(new ExplicitControllerLoader([UserController]))
    .build();

const businessApp = FlexibleApp.builder()
    .withContainer(businessContainer)
    .addEventSource(businessEventSource)
    .addFramework(businessFramework)
    .createApp();
```

## Migration from InversifyJS

If you're upgrading from flexible-decorators v0.1.x (InversifyJS) to v0.2.0+ (TSyringe):

### Decorator Changes

```typescript
// Before (InversifyJS)
import { inject, injectable } from "inversify";

@injectable()
@Controller()
export class UserController {
    constructor(@inject(TYPES.UserService) private userService: UserService) {}
}

// After (TSyringe)
import { inject, injectable } from "tsyringe";

@injectable()
@Controller()
export class UserController {
    constructor(@inject(UserService.TYPE) private userService: UserService) {}
}
```

### Container Registration

```typescript
// Before (InversifyJS)
container.bind(TYPES.UserService).to(UserService);
container.bind(TYPES.Logger).toConstantValue(logger);

// After (TSyringe)
container.registerClass(UserService.TYPE, UserService);
container.registerValue(FLEXIBLE_APP_TYPES.LOGGER, logger);
```

### Multi-injection

```typescript
// Before (InversifyJS)
import { multiInject } from "inversify";

constructor(@multiInject(TYPES.Plugin) private plugins: Plugin[]) {}

// After (TSyringe)
import { injectAll } from "tsyringe";

constructor(@injectAll(Plugin.TYPE) private plugins: Plugin[]) {}
```

## Testing

Test controllers with dependency injection:

```typescript
import { FlexibleContainer } from "flexible-core";

describe("UserController", () => {
    let controller: UserController;
    let mockUserService: jasmine.SpyObj<UserService>;
    let container: FlexibleContainer;

    beforeEach(() => {
        mockUserService = jasmine.createSpyObj("UserService", ["getUser", "createUser"]);

        container = new FlexibleContainer();
        container.registerValue(UserService.TYPE, mockUserService);
        container.registerValue(FLEXIBLE_APP_TYPES.LOGGER, mockLogger);

        controller = container.resolve(UserController);
    });

    it("should get user by id", () => {
        const user = { id: "1", name: "John" };
        mockUserService.getUser.and.returnValue(user);

        const result = controller.getUser("1");

        expect(result).toBe(user);
        expect(mockUserService.getUser).toHaveBeenCalledWith("1");
    });
});
```

## API Reference

### Decorators

- `@Controller()` - Marks a class as a controller
- `@Route(filter)` - Defines a route handler
- `@BeforeExecution(middleware)` - Adds before-execution middleware
- `@AfterExecution(middleware)` - Adds after-execution middleware

### Parameter Decorators

- `@FromPath(key)` - Extract from URL path parameters
- `@FromQuery(key)` - Extract from query string
- `@FromBody()` - Extract from request body
- `@FromHeaders(key)` - Extract from request headers

### Controller Loaders

- `ExplicitControllerLoader` - Load specific controller classes
- `PathControllerLoader` - Load controllers from file system path

## Requirements

- Node.js 14+
- TypeScript 4.5+
- reflect-metadata
- flexible-core ^0.2.0

## License

MIT © [Federico Tacchini](https://github.com/ftacchini)

## Links

- [GitHub Repository](https://github.com/ftacchini/flexible-decorators)
- [npm Package](https://www.npmjs.com/package/flexible-decorators)
- [flexible-core](https://github.com/ftacchini/flexible-core)
- [flexible-http](https://github.com/ftacchini/flexible-http)
- [Examples](https://github.com/ftacchini/flexible-example-app)

---

**Made with ❤️ by the Flexible team**