# Template Server API
Template for server API with Typescript

----
## Structure
`users`


----
## Programming Tips
#### Naming variables
**_snake_case, camelCase and PascalCase_** - This code is using all those cases inside it, but each one have to be used in the right place.

**_"snake_case"_** - Used in enviroment constants and database columns. Column name in databases use to be low case, so camel can't be used as an option. Entities have to convert them in camel case to be used inside API.

**_"camelCase"_** - Used in variables and methods.

**_"PascalCase"_** - Used in enums, classes and interfaces. This last one by the way must to be used with an "I" before the interface name.

----
#### Filling some files
**_"Services"_** - Services can only have one single operation, a single service in API. This must have the name of a group followed by the name of the service. E.g.: "AuthenticateSessionService". Their folders must follow the same, a folder for the group (e.g.: "session") and inside a folder for the especified service (e.g.: "authenticate").

**_"Controllers"_** - Controls can contain more than one operation, but this have to be related in a group of services (if this can be possible to be separated in more than one group. If not, all Controllers MUST have to be especific from a service). E.g.: "SessionController". Inside of a grouped controller, you must specific the name of the service. E.g.: "Authenticate". If not grouped, the name is "handle".

**_"Routes"_** - Routes follows the same as controllers when there's more than one group. If not, only one route will embraces the controllers for model.

----
## Packages
#### Dependencies
**_"@sentry"_** - Used for monitoring and error tracking.

**_"aws-sdk"_** - Component to work with aws features and services.

**_"bcryptjs"_** - Used to hash and validate user password.

**_"celebrate"_** - Used as a middleware to validate "put" and "post" routes body.

**_"class-transformer"_** - Adapt class to ignore certain columns like password.

**_"dayjs"_** - Date manipulation.

**_"dotenv"_** - For ".env" files to be accepted.

**_"express"_** - HTTP request and response method.

**_"express-async-errors"_** - Let the possibility to use a class to proccess error messages.

**_"handlebars"_** - Uses templates to generate HTML or other text formats.

**_"ioredis"_** - Redis components. (IMPORTANT: "ioredis" works better than "redis" to use with "rate-limiter-flexible" bcoz you can perform a "commandTimeout" that returns an error if there's no return after the initial connection. Otherwise, timeout will only work in the first try connection and will freeze requests to API if a command doesn't get any answers).

**_"jsonwebtoken"_** - Method to authenticate services in "rest". Divided by 3 parts: Headers, Payload and Signature.

**_"mime"_** - Get detailed information of an imported file.

**_"mongodb"_** - MongoDB components.

**_"multer"_** - Middleware destinable to import images. Will save the file inside a specified folder (e.g.: "tmp").

**_"nodemailer"_** - Creates a transporter for mail sending, making it more easy to work.

**_"pg"_** - PostgreSQL components.

**_"rate-limiter-flexible"_** - Protect API against "brute force" attacks.

**_"reflect-metadata"_** - Used for typeORM to parse decorators and use it to building sql queries.

**_"swagger-ui-express"_** - Documentation for API routes.

**_"tsyringe"_** - Dependencies injection.

**_"typeorm"_** - TypeORM to estabilish connection to DB.

**_"uuid"_** - Used to create unic IDs.

----
#### DependenciesDev
**_"eslint"_** - Estabilish code patterns.

**_"jest"_** - For tests.

**_"prettier"_** - To validate and correct code.

**_"supertest"_** - Used to emulate requests of express in jest.

**_"ts-jest"_** - Jest configuration for typescript.

**_"ts-node-dev"_** - To run server without stopping even with an error.

**_"typescript"_** - Typescript.
