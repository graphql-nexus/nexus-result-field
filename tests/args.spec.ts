import { printSchema } from 'graphql'
import { makeSchema, nonNull, objectType } from 'nexus'
import { resultMutationField } from '~/resultMutationField'

it('works', () => {
  expect(
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
  ).toMatchInlineSnapshot(`
    "union CreateFooResult = Foo | HandleAlreadyTaken

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
    "
  `)
})
