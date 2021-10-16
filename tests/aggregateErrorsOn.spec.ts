import { printSchema } from 'graphql'
import { makeSchema, nonNull } from 'nexus'
import { resultMutationField } from '~/resultMutationField'
import { resultQueryField } from '~resultQueryField'
import { BusinessErrorHandleAlreadyTaken, BusinessErrorResourceNotFound, FooObject } from './__data__'

it('works', () => {
  expect(
    printSchema(
      makeSchema({
        types: [
          FooObject,
          BusinessErrorHandleAlreadyTaken,
          BusinessErrorResourceNotFound,
          resultQueryField({
            name: 'getFoo',
            successType: 'Foo',
            args: {
              id: nonNull('ID'),
            },

            errorTypes: [BusinessErrorResourceNotFound],
            resolve(_, args) {
              // ...
            },
          }),

          resultMutationField('createFoo', {
            successType: `Foo`,
            input(t: any) {
              t.nonNull.string('handle')
            },
            aggregateErrors: true,
            errorTypes: [BusinessErrorHandleAlreadyTaken],
            resolve(_, args) {
              // ...
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
    "type Foo {
      id: ID!
      handle: String!
    }

    type BusinessErrorHandleAlreadyTaken {
      message: String!
    }

    type BusinessErrorResourceNotFound {
      message: String!
    }

    union GetFooResult = Foo | BusinessErrorResourceNotFound

    union CreateFooResult = Foo | CreateFooErrors

    type CreateFooErrors {
      errors: [CreateFooError!]!
    }

    union CreateFooError = BusinessErrorHandleAlreadyTaken

    input CreateFooInput {
      handle: String!
    }

    type Query {
      getFoo(id: ID!): GetFooResult
    }

    type Mutation {
      createFoo(input: CreateFooInput!): CreateFooResult
    }
    "
  `)
})
