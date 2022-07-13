# Template Server API
Template for server API with Typescript

## Structure

## Packages
*bcryptjs* - Used to hash and validate user password
*class-transformer* - Adapt class to ignore certain columns like password
*dotenv* - For ".env" files to be accepted
*express* - HTTP request and response method
*express-async-errors* - Let the possibility to use a class to proccess error messages
*pg* - PostgreSQL components
*reflect-metadata* - Used for typeORM to parse decorators and use it to building sql queries
*swagger-ui-express* - Documentation for API routes
*tsyringe* - Dependencies injection
*typeorm* - TypeORM to estabilish connection to DB
*uuid* - Used to create unic ID`s

*eslint* - Estabilish code patterns
*jest* - For tests
*prettier* - To validate and correct code
*supertest* - Used to emulate requests of express in jest
*ts-jest* - Jest configuration for typescript
*ts-node-dev* - To run server without stopping even with an error
*typescript* - Typescript