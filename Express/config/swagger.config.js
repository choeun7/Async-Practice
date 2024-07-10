import SwaggerJsdoc from "swagger-jsdoc";

const options = {
    definition: {
        info: {
            title: 'Node Study API',
            version: '1.0.0',
            description: 'Node Study API with express, API 설명'
        },
        host: 'localhost:3000',
        basepath: "../"
    },
    apis: ['./src/routes/*.js', './swagger/*']
};

export const specs = SwaggerJsdoc(options);
