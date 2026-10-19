# User & Product REST API

Express REST API with user authentication, product management, MySQL and MongoDB integrations.

[Live deployment](https://api-dervelopment.vercel.app)

## Overview

- User and product routes
- JWT authentication middleware
- Controller and service layers
- Regression tests for users, products, and startup

## Stack

Express, MongoDB / Mongoose.

## Run locally

```bash
git clone https://github.com/AbdulSamadAhsan/APIDervelopment.git
cd APIDervelopment
npm install
```

Copy `.env.example` to `.env` and configure the values for your local environment before starting. Use your own database credentials and freshly generated secrets.

Configure MySQL for user storage and MongoDB for product storage. See `.env.example` for variable names and [TESTING.md](TESTING.md) for test details.

```bash
npm run dev
```

Use the local URL printed by the development server.

## Available checks

| Command | Script |
| --- | --- |
| `npm run test` | `node --test` |

These commands are defined by the project; documentation updates do not imply they have been run.

## Author

[Syed Abdul Samad Ahsan](https://github.com/AbdulSamadAhsan)
