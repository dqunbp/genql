#!/usr/bin/env node
import chalk from 'chalk'
import yargs from 'yargs'
import { generateProject } from './main'
import { validateConfigs } from './tasks/validateConfigs'
import { Config } from './config'

const program = yargs
    .option('output', {
        alias: 'o',
        description: 'Output directory',
        required: true,
        type: 'string',
    })
    .option('endpoint', {
        alias: 'e',
        description: 'Graphql endpoint',
        type: 'string',
    })
    .option('endpoint', {
        alias: 'e',
        description: 'Graphql endpoint',
        type: 'string',
    })
    .option('get', {
        alias: 'g',
        description: 'use GET for introspection query',
        type: 'boolean',
    })
    .option('schema', {
        alias: 's',
        type: 'string',
        description: 'path to GraphQL schema definition file',
    })
    // .array('header', )
    .option('header', {
        alias: 'H',
        type: 'array',
        // string: true,
        description: 'header to use in introspection query',
    })
    .option('scalar', {
        alias: 'S',
        type: 'array',
        // string: true,
        description:
            'map a scalar to a type, for example `-S DateTime:string` ',
    })
    .option('verbose', { alias: 'v', type: 'boolean', default: false })
    .example(
        '$0 --output ./generated --endpoint http://localhost:3000  -H "Authorization: Bearer xxx"',
        'generate the client from an endpoint',
    )
    .example(
        '$0 --output ./generated --schema ./schema.graphql',
        'generate the client from a schema',
    )
    .help('help').argv

// .option('-o, --output <./myClient>', 'output directory')
// .option('-e, --endpoint <http://example.com/graphql>', 'GraphQL endpoint')
// .option('-g, --get', 'use GET for introspection query')
// .option(
//     '-s, --schema <./mySchema.graphql>',
//     'path to GraphQL schema definition file',
// )
// .option(
//     '-f, --fetcher <./schemaFetcher.js>',
//     'path to introspection query fetcher file',
// )
// .option('-H', '--header')
// .option('-v, --verbose', 'verbose output')
// .parse(process.argv)

const config: Config = {
    endpoint: program.endpoint,
    useGet: program.get,
    schema: program.schema,
    output: program.output,
    headers: parseColonSeparatedStrings(program.header || []),
    scalarTypes: parseColonSeparatedStrings(program.scalar || []),
}

if (!validateConfigs([config])) {
    process.exit(1)
}

generateProject(config)
    .catch((e: any) => {
        console.error(e)
        process.exit(1)
    })
    .then(() => {
        printHelp({
            dirPath: program.output,
            useYarn: false,
            dependencies: ['genql-runtime'],
        })
    })

function parseColonSeparatedStrings(headersArray) {
    // console.log(headersArray)
    let obj = {}
    if (headersArray) {
        for (let h of headersArray) {
            const parts = String(h).split(':')
            if (parts.length !== 2) {
                console.error(`cannot parse string '${h}' (multiple or no ':')`)
                process.exit(1)
            }
            obj[parts[0].trim()] = parts[1].trim()
        }
    }
    return obj
}

export function printHelp({ useYarn, dirPath, dependencies }) {
    console.log()
    console.log(
        `${chalk.green('Success!')} Generated client code at '${dirPath}'`,
    )
    console.log()
    console.log(
        chalk.bold('Remember to install the necessary runtime packages with:'),
    )
    console.log()
    console.log(
        `  ${chalk.cyan(
            `${useYarn ? 'yarn add' : 'npm install'} ${dependencies.join(' ')}`,
        )}`,
    )
    console.log()
}
