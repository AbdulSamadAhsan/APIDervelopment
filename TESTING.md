# API regression tests

Run with Node.js 22 or later:

```sh
npm ci
npm test
```

Run one area:

```sh
node --test test/users.test.js
node --test test/products.test.js
node --test test/startup.test.js
```

The suite contains 44 tests. It starts the exported Express app on a temporary
localhost port and sends real HTTP requests through its routes and controllers.
No production credentials or running databases are required, and no production
records are created, updated, or deleted.

- Users: creation, required fields, duplicate email, password hashing and
  password omission, list/read/update/delete, missing records, login success and
  failures, token verification, expired tokens, and profile API-key checks.
- Products: creation, schema validation, duplicate names, list/read/update/delete,
  missing records, invalid IDs, price conversion, query failures, and connection
  failure handling.
- Startup: concurrent MongoDB connection reuse, retry after failure, missing URI,
  and waiting for MongoDB before starting the local server.

User tests replace the SQL transport while retaining the real User model,
controllers, bcrypt, and JWT implementation. Product tests retain the real
Mongoose schema but mock database operations. Startup tests isolate the database
connector with a fake Mongoose connection.

These tests do not verify real MySQL/MongoDB connectivity, database permissions,
indexes, Vercel settings, or concurrent duplicate-insert behavior. Successful local
tests do not by themselves prove the production databases are reachable.

Some failure cases intentionally produce error logs; use the final test summary
and process exit code to determine whether the suite passed.
