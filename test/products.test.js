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

async function request(method, route, body) {
    if (!server.listening) await once(server, "listening");
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/products${route}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body)
    });
    return { status: response.status, body: await response.json() };
}
const post = body => request("POST", "/create", body);

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

test("products: list returns count and data", async t => {
    t.mock.method(Product, "find", async () => [valid]);
    const result = await request("GET", "/");
    assert.equal(result.status, 200);
    assert.equal(result.body.count, 1);
    assert.deepEqual(result.body.data, [valid]);
});

test("products: read returns selected product", async t => {
    t.mock.method(Product, "findById", async id => { assert.equal(id, "abc"); return valid; });
    const result = await request("GET", "/abc");
    assert.equal(result.status, 200);
    assert.deepEqual(result.body.data, valid);
});

for (const [method, modelMethod] of [["GET", "findById"], ["DELETE", "findByIdAndDelete"], ["PUT", "findByIdAndUpdate"]]) {
    test(`products: ${method} missing product returns 404`, async t => {
        t.mock.method(Product, modelMethod, async () => null);
        assert.equal((await request(method, "/abc", method === "PUT" ? valid : undefined)).status, 404);
    });
    test(`products: ${method} invalid ID returns 400`, async t => {
        t.mock.method(Product, modelMethod, async () => { throw new (require("mongoose").Error.CastError)("ObjectId", "bad", "_id"); });
        assert.equal((await request(method, "/bad", method === "PUT" ? valid : undefined)).status, 400);
    });
}

test("products: update trims name, converts price, and enables validators", async t => {
    t.mock.method(Product, "findByIdAndUpdate", async (id, data, options) => {
        assert.equal(data.name, "Test Product");
        assert.equal(data.price, 2000);
        assert.equal(options.runValidators, true);
        assert.equal(options.returnDocument, "after");
        return data;
    });
    const result = await request("PUT", "/abc", { ...valid, price: "2000" });
    assert.equal(result.status, 200);
    assert.equal(result.body.data.price, 2000);
});

test("products: invalid update returns 400 without a database update", async t => {
    const update = t.mock.method(Product, "findByIdAndUpdate", async () => assert.fail("must not update"));
    for (const body of [{}, { ...valid, price: "bad" }, { ...valid, price: 999 }, { ...valid, price: 10001 }]) {
        assert.equal((await request("PUT", "/abc", body)).status, 400);
    }
    assert.equal(update.mock.callCount(), 0);
});

test("products: delete returns success", async t => {
    t.mock.method(Product, "findByIdAndDelete", async () => valid);
    const result = await request("DELETE", "/abc");
    assert.equal(result.status, 200);
    assert.equal(result.body.success, true);
});

test("products: query failure returns 500", async t => {
    t.mock.method(Product, "find", async () => { throw new Error("Query failed"); });
    assert.equal((await request("GET", "/")).status, 500);
});

for (const [field, value] of [["price", 10001], ["stock", 4], ["stock", 11], ["brand", ""], ["category", "x"], ["category", "too-long-category"]]) {
    test(`products: create rejects invalid ${field}=${value}`, async t => {
        const query = t.mock.method(Product, "findOne", async () => assert.fail("must not query"));
        assert.equal((await post({ ...valid, [field]: value })).status, 400);
        assert.equal(query.mock.callCount(), 0);
    });
}
