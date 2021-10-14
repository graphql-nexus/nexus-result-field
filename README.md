# nexus-result-field

[![trunk](https://github.com/graphql-nexus/nexus-result-field/actions/workflows/trunk.yml/badge.svg)](https://github.com/graphql-nexus/nexus-result-field/actions/workflows/trunk.yml)

<!-- toc -->

- [Installation](#installation)
- [Features](#features)
- [Introduction](#introduction)
- [Guide](#guide)
  - [Input as Object](#input-as-object)
  - [Input as Plain Args](#input-as-plain-args)
  - [Result as Aggregate Error](#result-as-aggregate-error)
  - [Result as Single Error](#result-as-single-error)
- [Reference Docs](#reference-docs)

<!-- tocstop -->

## Installation

```
npm add nexus-result-field
```

Peer dependencies: `nexus`, `graphql`

## Features

- API mimicks `mutationField`/`queryField` making it easy to pickup.
- Type safe implementation of GraphQL Result fields schema pattern (read more below)

## Introduction

`nexus-result-field` makes it easy to encode query and mutation operation errors in your schema with [Nexus](https://nexusjs.org).

Here are some pre-requisite readings that will probably help you understand this library:

1. [Marc Andre's GraphQL Errors guide](https://productionreadygraphql.com/2020-08-01-guide-to-graphql-errors), a thorough but succinct introduction into the problem space.
2. [Nexus tutorial](https://nexusjs.org/docs/getting-started/tutorial), a primer on what Nexus is all about if you don't already know.

But if you just want a quick elevator pitch here it is:

If you are at all familiar with functional programming then you might have heard of Either and Optional/Maybe types. The idea here is similar: when a caller (the GraphQL API client) executes an operation (sends queries or mutations), instead of either returning or throwing an error (the GraphQL API equivilant of throwing is returning ad-hoc untyped errors in the JSON envelope) you encode the error case into the type system, treating it as _data_.

This approach to errors benefits your API clients by letting them leverage the rich GraphQL type system for not just the happy path but also the unhappy path. This makes a lot of sense for many real-world applications these two things are true:

1. You chose GraphQL in part because of its type system.
2. Your API has many IO interactions with the outside world (databases, other APIs, ...).
3. You do/want to handle errors seriously and gracefully.

The guide below will tour the main API features. For detailed reference, refer to the JSDoc.

## Guide

The following guide works with `resultMutationField` but not there is `resultQueryField` which works the same way but for `Query` type instead of `Mutation` type.

### Input as Object

```ts
import { makeSchema } from 'nexus'
import { printSchema } from 'grpahql'

printSchema(
  makeSchema({
    types: [
      resultMutationField({
        name: 'createFoo',
        input(t) {
          t.nonNull.string('handle')
        },
        errorTypes: ['HandleAlreadyTaken'],
        successType: `Foo`,
        resolve(_, args) {
          // ...
          return {
            __typename: `Foo`,
            id: 'abc',
            handle: args.input.handle,
          }
        },
      }),
      objectType({
        name: 'Foo',
        definition(t) {
          t.nonNull.id('id')
          t.nonNull.string('handle')
        },
      }),
      objectType({
        name: 'HandleAlreadyTaken',
        definition(t) {
          t.string('message')
        },
      }),
    ],
    features: {
      abstractTypeStrategies: {
        __typename: true,
      },
    },
  })
)
```

```graphql
type Foo {
  id: ID!
  handle: String!
}

type HandleAlreadyTaken {
  message: String
}

union CreateFooResult = Foo | HandleAlreadyTaken

input CreateFooInput {
  handle: String!
}

type Query {
  ok: Boolean!
}

type Mutation {
  createFoo(input: CreateFooInput!): CreateFooResult
}
```

### Input as Plain Args

```ts
printSchema(
  makeSchema({
    types: [
      resultMutationField('createFoo', {
        successType: `Foo`,
        args: {
          handle: nonNull('String'),
        },
        errorTypes: ['HandleAlreadyTaken'],
        resolve(_, args) {
          // ...
        },
      }),
      objectType({
        name: 'Foo',
        definition(t) {
          t.nonNull.id('id')
          t.nonNull.string('handle')
        },
      }),
      objectType({
        name: 'HandleAlreadyTaken',
        definition(t) {
          t.nonNull.string('message')
        },
      }),
    ],
    features: {
      abstractTypeStrategies: {
        __typename: true,
      },
    },
  })
)
```

```graphql
union CreateFooResult = Foo | HandleAlreadyTaken

type Foo {
  id: ID!
  handle: String!
}

type HandleAlreadyTaken {
  message: String!
}

type Query {
  ok: Boolean!
}

type Mutation {
  createFoo(handle: String!): CreateFooResult
}
```

### Result as Aggregate Error

```ts
printSchema(
  makeSchema({
    types: [
      resultMutationField('createFoo', {
        successType: `Foo`,
        input(t) {
          t.nonNull.string('handle')
        },
        aggregateErrors: true,
        errorTypes: ['HandleAlreadyTaken'],
        resolve(_, args) {
          // ...
        },
      }),

      objectType({
        name: 'Foo',
        definition(t) {
          t.nonNull.id('id')
          t.nonNull.string('handle')
        },
      }),

      objectType({
        name: 'HandleAlreadyTaken',
        definition(t) {
          t.nonNull.string('message')
        },
      }),
    ],

    features: {
      abstractTypeStrategies: {
        __typename: true,
      },
    },
  })
)
```

```graphql
union CreateFooResult = Foo | CreateFooErrors

type CreateFooErrors {
  errors: [CreateFooError!]!
}

union CreateFooError = HandleAlreadyTaken

input CreateFooInput {
  handle: String!
}

type Foo {
  id: ID!
  handle: String!
}

type HandleAlreadyTaken {
  message: String!
}

type Query {
  ok: Boolean!
}

type Mutation {
  createFoo(input: CreateFooInput!): CreateFooResult
}
```

### Result as Single Error

```ts
import { makeSchema } from 'nexus'
import { printSchema } from 'grpahql'

printSchema(
  makeSchema({
    types: [
      resultMutationField({
        name: 'createFoo',
        input(t) {
          t.nonNull.string('handle')
        },
        errorTypes: ['HandleAlreadyTaken'],
        successType: `Foo`,
        resolve(_, args) {
          // ...
          return {
            __typename: `Foo`,
            id: 'abc',
            handle: args.input.handle,
          }
        },
      }),
      objectType({
        name: 'Foo',
        definition(t) {
          t.nonNull.id('id')
          t.nonNull.string('handle')
        },
      }),
      objectType({
        name: 'HandleAlreadyTaken',
        definition(t) {
          t.string('message')
        },
      }),
    ],
    features: {
      abstractTypeStrategies: {
        __typename: true,
      },
    },
  })
)
```

```graphql
type Foo {
  id: ID!
  handle: String!
}

type HandleAlreadyTaken {
  message: String
}

union CreateFooResult = Foo | HandleAlreadyTaken

input CreateFooInput {
  handle: String!
}

type Query {
  ok: Boolean!
}

type Mutation {
  createFoo(input: CreateFooInput!): CreateFooResult
}
```

## Reference Docs

[Read reference documentation on Paka](https://paka.dev/npm/nexus-result-field)
