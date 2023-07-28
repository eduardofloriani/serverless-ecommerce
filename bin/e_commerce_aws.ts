#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProductAppStack } from '../lib/productsApp-stack';
import { ECommerceApiStack } from '../lib/ecommerceApi-stack';
import { ProductsAppLayersStack } from '../lib/productsAppLayers-stack';
import { EventsDdbStack } from 'lib/eventsDdb-stack';

const app = new cdk.App();

const env: cdk.Environment = {
    account: process.env.AWS_ACCOUNT_ID,
    region: 'us-east-1',
};

const tags = {
    cost: 'ECommerce',
    team: 'EduardoTeam',
};

const productsAppLayersStack = new ProductsAppLayersStack(app, 'ProductsAppLayers', {
    tags: tags,
    env: env,
});

const eventsDdbStack = new EventsDdbStack(app, 'EventsDdb', {
    tags: tags,
    env: env,
});

const productsAppStack = new ProductAppStack(app, 'ProductsApp', {
    eventsDdb: eventsDdbStack.table,
    tags: tags,
    env: env,
});
productsAppStack.addDependency(productsAppLayersStack);
productsAppStack.addDependency(eventsDdbStack);

const eCommerceApiStack = new ECommerceApiStack(app, 'ECommerceApi', {
    productsFetchHandler: productsAppStack.productsFetchHandler,
    productsAdminHandler: productsAppStack.productsAdminHandler,
    tags: tags,
    env: env,
});
eCommerceApiStack.addDependency(productsAppStack);
