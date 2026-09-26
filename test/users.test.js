const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "test-only-signing-key-not-for-production";
process.env.JWT_EXPIRES_IN = "1h";
process.env.API_KEY = "test-only-api-key";
// Keep real routes, controllers, JWT and hashing; replace only SQL transport.
const sql = { execute: async () => { throw new Error("Unexpected SQL operation"); } };
require.cache[require.resolve("../config/database")] = { exports: sql };
const app = require("../app");
const server = app.listen(0, "127.0.0.1");
after(() => new Promise(resolve => server.close(resolve)));
const user = { id: 7, name: "Test User", email: "user@example.test" };
const password = "test-password-123";
const hash = bcrypt.hashSync(password, 4);

async function request(method, route, body, headers = {}) {
    if (!server.listening) await once(server, "listening");
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/users${route}`, {
        method, headers: { "Content-Type": "application/json", ...headers },
        body: body === undefined ? undefined : JSON.stringify(body)
    });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    return { status: response.status, body: data };
}

test("users: create hashes the password and never returns it", async t => {
    const calls = [];
    t.mock.method(sql, "execute", async (query, params) => {
        calls.push(query);
        if (query.includes("WHERE email")) return [[]];
        if (query.startsWith("INSERT")) {
            assert.deepEqual(params.slice(0, 2), [user.name, user.email]);
            assert.notEqual(params[2], password);
            assert.equal(await bcrypt.compare(password, params[2]), true);
            return [{ insertId: user.id }];
        }
        return [[{ ...user, password: hash }]];
    });
    const result = await request("POST", "/create", { ...user, password });
    assert.equal(result.status, 201);
    assert.deepEqual(result.body.data, user);
    assert.equal(calls.length, 3);
});

for (const body of [{}, { name: user.name }, { name: user.name, email: user.email }]) {
    test(`users: create rejects missing fields ${JSON.stringify(body)}`, async () => {
        assert.equal((await request("POST", "/create", body)).status, 400);
    });
}

test("users: duplicate email returns 409 without inserting", async t => {
    t.mock.method(sql, "execute", async query => {
        assert.match(query, /SELECT/);
        return [[{ ...user }]];
    });
    assert.equal((await request("POST", "/create", { ...user, password })).status, 409);
});

test("users: list and read omit password", async t => {
    t.mock.method(sql, "execute", async query => {
        if (query.includes("WHERE id")) return [[{ ...user, password: hash }]];
        assert.match(query, /SELECT id,email,name,created_at/);
        return [[{ ...user }]];
    });
    const list = await request("GET", "/");
    assert.equal(list.status, 200);
    assert.deepEqual(list.body.data, [user]);
    const single = await request("GET", "/7");
    assert.equal(single.status, 200);
    assert.deepEqual(single.body.data, user);
});

for (const method of ["GET", "PUT", "DELETE"]) {
    test(`users: ${method} unknown user returns 404`, async t => {
        t.mock.method(sql, "execute", async () => method === "GET" ? [[]] : [{ affectedRows: 0 }]);
        assert.equal((await request(method, method === "PUT" ? "/7/update" : "/7", method === "PUT" ? user : undefined)).status, 404);
    });
}

for (const newPassword of [undefined, "replacement-password"]) {
    test(`users: update ${newPassword ? "hashes new password" : "preserves existing password"}`, async t => {
        t.mock.method(sql, "execute", async (query, params) => {
            if (query.trim().startsWith("UPDATE")) {
                if (newPassword) assert.equal(await bcrypt.compare(newPassword, params[2]), true);
                else assert.equal(params.length, 3);
                return [{ affectedRows: 1 }];
            }
            return [[{ ...user, password: hash }]];
        });
        const result = await request("PUT", "/7/update", { ...user, password: newPassword });
        assert.equal(result.status, 200);
        assert.deepEqual(result.body.data, user);
    });
}

test("users: delete returns success", async t => {
    t.mock.method(sql, "execute", async (query, params) => {
        assert.match(query, /DELETE FROM users WHERE id = \?/);
        assert.deepEqual(params, ["7"]);
        return [{ affectedRows: 1 }];
    });
    assert.equal((await request("DELETE", "/7")).status, 200);
});

test("users: database errors return JSON 500", async t => {
    t.mock.method(sql, "execute", async () => { throw new Error("SQL offline"); });
    const result = await request("GET", "/");
    assert.equal(result.status, 500);
    assert.equal(result.body.message, "Server error");
});

test("users: login signs a verifiable token without the password", async t => {
    t.mock.method(sql, "execute", async () => [[{ ...user, password: hash }]]);
    const result = await request("POST", "/login", { email: user.email, password });
    assert.equal(result.status, 200);
    const claims = jwt.verify(result.body.token, process.env.JWT_SECRET);
    assert.equal(claims.id, user.id);
    assert.equal(claims.password, undefined);
});

test("users: unknown login returns 404 without signing a token", async t => {
    t.mock.method(sql, "execute", async () => [[]]);
    const sign = t.mock.method(jwt, "sign", () => assert.fail("must not sign"));
    assert.equal((await request("POST", "/login", { email: user.email, password })).status, 404);
    assert.equal(sign.mock.callCount(), 0);
});

test("users: wrong password stops before signing a token", async t => {
    t.mock.method(sql, "execute", async () => [[{ ...user, password: hash }]]);
    const sign = t.mock.method(jwt, "sign", () => assert.fail("must not sign"));
    assert.equal((await request("POST", "/login", { email: user.email, password: "wrong" })).status, 404);
    assert.equal(sign.mock.callCount(), 0);
});

test("users: login database failures return JSON 500", async t => {
    t.mock.method(sql, "execute", async () => { throw new Error("SQL offline"); });
    const result = await request("POST", "/login", { email: user.email, password });
    assert.equal(result.status, 500);
    assert.equal(result.body.message, "Server error");
});

for (const body of [{}, { email: user.email }]) {
    test(`users: login rejects missing fields ${JSON.stringify(body)}`, async () => {
        assert.equal((await request("POST", "/login", body)).status, 400);
    });
}

test("users: profile requires valid JWT and API key", async () => {
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });
    const auth = { Authorization: `Bearer ${token}` };
    assert.equal((await request("GET", "/profile")).status, 401);
    assert.equal((await request("GET", "/profile", undefined, { Authorization: "Bearer invalid" })).status, 401);
    assert.equal((await request("GET", "/profile", undefined, auth)).status, 401);
    assert.equal((await request("GET", "/profile", undefined, { ...auth, "x-api-key": "wrong" })).status, 403);
    const result = await request("GET", "/profile", undefined, { ...auth, "x-api-key": process.env.API_KEY });
    assert.equal(result.status, 200);
    assert.equal(result.body.id, user.id);
    const expired = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: -1 });
    assert.equal((await request("GET", "/profile", undefined, { ...auth, Authorization: `Bearer ${expired}` })).status, 401);
});
