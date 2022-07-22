# Template Server API
Template for server API with Typescript

## Structure

## Programming Tips
*Services* - Services can only have one single operation, a single service in API. This must have the name of a group followed by the name of the service. E.g.: "AuthenticateSessionService".

*Controllers* - Controls can contain more than one operation, but this have to be related in a group of services (if this can be possible to be separated in more than one group. If not, all Controllers MUST have to be especific from a service). E.g.: "SessionController". Inside of a grouped controller, you must specific the name of the service. E.g.: "Authenticate". If not grouped, the name is "handle".

*Routes* - Routes follows the same as controllers when there's more than one group. If not, only one route will embraces the controllers for model.

## Packages
#### Dependencies
*bcryptjs* - Used to hash and validate user password.

*celebrate* - Used as a middleware to validate "put" and "post" routes body.

*class-transformer* - Adapt class to ignore certain columns like password.

*dayjs* - Date manipulation.

*dotenv* - For ".env" files to be accepted.

*express* - HTTP request and response method.

*express-async-errors* - Let the possibility to use a class to proccess error messages.

*handlebars* - Uses templates to generate HTML or other text formats.

*jsonwebtoken* - Method to authenticate services in "rest". Divided by 3 parts: Headers, Payload and Signature.

*nodemailer* - Use ethereal for test mail sending.

*pg* - PostgreSQL components.

*reflect-metadata* - Used for typeORM to parse decorators and use it to building sql queries.

*swagger-ui-express* - Documentation for API routes.

*tsyringe* - Dependencies injection.

*typeorm* - TypeORM to estabilish connection to DB.

*uuid* - Used to create unic IDs.

#### DependenciesDev
*eslint* - Estabilish code patterns.

*jest* - For tests.

*prettier* - To validate and correct code.

*supertest* - Used to emulate requests of express in jest.

*ts-jest* - Jest configuration for typescript.

*ts-node-dev* - To run server without stopping even with an error.

*typescript* - Typescript.