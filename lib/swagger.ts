import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
    const spec = createSwaggerSpec({
        apiFolder: 'src/app/api', // define api folder
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'Personal Finance Tracker API',
                version: '1.0.0',
                description: 'API documentation for the Personal Finance Tracker application',
            },
            components: {
                securitySchemes: {
                    BearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                },
            },
            security: [],
        },
    });
    return spec;
};
