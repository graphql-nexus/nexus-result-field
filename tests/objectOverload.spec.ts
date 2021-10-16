import { printSchema } from 'graphql'
import { makeSchema, nonNull } from 'nexus'
import { resultMutationField } from '~resultMutationField'
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

          resultMutationField({
            name: 'createFoo',
            successType: `Foo`,
            args: {
              handle: nonNull('String'),
            },

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

    union CreateFooResult = Foo | BusinessErrorHandleAlreadyTaken

    type Query {
      getFoo(id: ID!): GetFooResult
    }

    type Mutation {
      createFoo(handle: String!): CreateFooResult
    }
    "
  `)
})
