#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProductAppStack } from '../lib/productsApp-stack';
import { ECommerceApiStack } from '../lib/ecommerceApi-stack';
import { ProductsAppLayersStack } from '../lib/productsAppLayers-stack';
import { EventsDdbStack } from '../lib/eventsDdb-stack';
import { OrdersAppLayerStack } from '../lib/ordersAppLayer-stack';
import { OrdersAppStack } from '../lib/ordersApp-stack';
import { InvoiceWSApiStack } from '../lib/invoiceWSApi-stack';
import { InvoicesAppLayerStack } from '../lib/invoicesAppLayers-stack';

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

const ordersAppLayerStack = new OrdersAppLayerStack(app, 'OrdersAppLayers', {
    tags: tags,
    env: env,
});

const ordersAppStack = new OrdersAppStack(app, 'OrdersApp', {
    tags: tags,
    env: env,
    productsDdb: productsAppStack.productsDdb,
    eventsDdb: eventsDdbStack.table,
});
ordersAppStack.addDependency(ordersAppLayerStack);
ordersAppStack.addDependency(productsAppStack);
ordersAppStack.addDependency(eventsDdbStack);

const eCommerceApiStack = new ECommerceApiStack(app, 'ECommerceApi', {
    productsFetchHandler: productsAppStack.productsFetchHandler,
    productsAdminHandler: productsAppStack.productsAdminHandler,
    ordersHandler: ordersAppStack.ordersHandler,
    orderEventsFetchHandler: ordersAppStack.orderEventsFetchHandler,
    tags: tags,
    env: env,
});
eCommerceApiStack.addDependency(productsAppStack);
eCommerceApiStack.addDependency(ordersAppStack);

const invoicesAppLayerStack = new InvoicesAppLayerStack(app, 'InvoicesAppLayer', {
    tags: {
        cost: 'InvoiceApp',
        team: 'Eduardo',
    },
    env: env,
});

const invoiceWSApiStack = new InvoiceWSApiStack(app, 'InvoiceApi', {
    tags: {
        cost: 'InvoiceApp',
        team: 'Eduardo',
    },
    env: env,
});
invoiceWSApiStack.addDependency(invoicesAppLayerStack);
