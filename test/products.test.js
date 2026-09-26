const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");

// Exercise the exported serverless app without touching either real database.
const userRoutesPath = require.resolve("../routes/userRoutes");
require.cache[userRoutesPath] = { exports: require("express").Router() };
const dbPath = require.resolve("../config/mongodb");
let connect = async () => {};
require.cache[dbPath] = { exports: () => connect() };
const app = require("../app");
const Product = require("../models/Product");
const server = app.listen(0, "127.0.0.1");
after(() => new Promise(resolve => server.close(resolve)));

async function post(body) {
    if (!server.listening) await once(server, "listening");
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/products/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    return { status: response.status, body: await response.json() };
}

const valid = { name: " Test Product ", price: 1500, brand: "Test", category: "Tools", stock: 5 };

test("exported app waits for MongoDB before creating a product", async t => {
    let connected = false;
    connect = async () => { await new Promise(resolve => setImmediate(resolve)); connected = true; };
    t.mock.method(Product, "findOne", async filter => {
        assert.equal(connected, true);
        assert.equal(filter.name, "Test Product");
        return null;
    });
    t.mock.method(Product.prototype, "save", async function () { return this; });
    const result = await post(valid);
    assert.equal(result.status, 201);
    assert.equal(result.body.data.name, "Test Product");
});

test("database failures return 503 without executing a product query", async t => {
    connect = async () => { throw new Error("Test connection failure"); };
    const query = t.mock.method(Product, "findOne", async () => assert.fail("must not query"));
    const result = await post(valid);
    assert.equal(result.status, 503);
    assert.equal(result.body.message, "Database unavailable");
    assert.equal(query.mock.callCount(), 0);
});

test("invalid bodies return 400 before a product query", async t => {
    connect = async () => {};
    const query = t.mock.method(Product, "findOne", async () => assert.fail("must not query"));
    for (const body of [{}, { name: 123 }, { name: " " }, { name: "Test" }, { ...valid, price: 1 }]) {
        assert.equal((await post(body)).status, 400);
    }
    assert.equal(query.mock.callCount(), 0);
});

test("duplicate products return 409 without saving", async t => {
    connect = async () => {};
    t.mock.method(Product, "findOne", async () => ({ name: "Test Product" }));
    const save = t.mock.method(Product.prototype, "save", async () => assert.fail("must not save"));
    assert.equal((await post(valid)).status, 409);
    assert.equal(save.mock.callCount(), 0);
});
