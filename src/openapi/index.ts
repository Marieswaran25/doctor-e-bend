import swaggerJsdoc from 'swagger-jsdoc';

import { loadYaml } from './loadYaml';

const { paths, tags, components } = loadYaml('docs');

const options: swaggerJsdoc.OAS3Options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Doctor E OpenAPI',
            version: '1.0.0',
            description: 'API documentation of the Doctor E',
        },
        servers: [
            {
                url: 'http://localhost:5000/api/v1',
                description: 'Localhost',
            },

            {
                url: 'https://doctor-e-bend.onrender.com/api/v1',
                description: 'Development',
            },
        ],
        paths,
        tags,
        components,
    },
    apis: [],
};

const specs = swaggerJsdoc(options);

export default specs;
