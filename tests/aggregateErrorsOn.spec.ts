import { printSchema } from 'graphql'
import { makeSchema, objectType } from 'nexus'
import { resultMutationField } from '~/resultMutationField'

it('works', () => {
  expect(
    printSchema(
      makeSchema({
        types: [
          resultMutationField('createFoo', {
            successType: `Foo`,
            input(t: any) {
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
  ).toMatchInlineSnapshot(`
    "union CreateFooResult = Foo | CreateFooErrors

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
    "
  `)
})
