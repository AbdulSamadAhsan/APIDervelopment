const { test } = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");

const source = file => fs.readFileSync(path.join(__dirname, "..", file), "utf8");

test("MongoDB shares concurrent connection attempts, reuses success, and retries failures", async () => {
    let calls = 0;
    let resolveConnection;
    const mongoose = {
        connection: { readyState: 0 },
        connect: () => {
            calls++;
            return new Promise(resolve => { resolveConnection = resolve; });
        }
    };
    const context = { require: () => mongoose, module: { exports: {} }, process: { env: { MONGO_URI: "mongodb://test.invalid/test" } } };
    vm.runInNewContext(source("config/mongodb.js"), context);
    const connectDB = context.module.exports;
    const first = connectDB();
    const second = connectDB();
    assert.equal(calls, 1);
    mongoose.connection.readyState = 1;
    resolveConnection(mongoose);
    await Promise.all([first, second]);
    await connectDB();
    assert.equal(calls, 1);

    mongoose.connection.readyState = 0;
    mongoose.connect = async () => { calls++; throw new Error("offline"); };
    await assert.rejects(connectDB(), /offline/);
    mongoose.connect = async () => { calls++; return mongoose; };
    await connectDB();
    assert.equal(calls, 3);
    delete context.process.env.MONGO_URI;
    await assert.rejects(connectDB(), /MONGO_URI is not defined/);
});

test("local server does not listen before MongoDB is ready", async () => {
    let resolveConnection;
    let listened = false;
    const app = { listen: () => { listened = true; } };
    vm.runInNewContext(source("server.js"), {
        require: name => name === "./app" ? app : () => new Promise(resolve => { resolveConnection = resolve; }),
        process: { env: {}, exit: () => assert.fail("unexpected exit") },
        console
    });
    assert.equal(listened, false);
    resolveConnection();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(listened, true);
});
