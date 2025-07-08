import { readdirSync } from 'fs';
import path from 'path';
import { Components, Paths, Tag } from 'swagger-jsdoc';
import YAML from 'yamljs';

export interface SwaggerData {
    paths: Paths;
    tags: Tag[];
    components: Components;
}

export function loadYaml(dirname: string = 'docs'): SwaggerData {
    const routeFiles = readdirSync(path.join(__dirname, dirname));
    const swaggerData: SwaggerData = {
        paths: {},
        tags: [],
        components: {},
    };

    routeFiles.forEach((file: string) => {
        const filePath = path.join(__dirname, dirname, file);

        const routeData = YAML.load(filePath);

        if (typeof routeData === 'object' && routeData !== null) {
            if (Array.isArray(routeData.tags)) {
                swaggerData.tags.push(...routeData.tags);
            }

            Object.assign(swaggerData.paths, routeData.paths);
            Object.assign(swaggerData.components, routeData.components);
        } else {
            console.error(`Invalid YAML data in file: ${file}`);
        }
    });

    return swaggerData;
}
