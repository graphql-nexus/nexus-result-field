import { objectType } from 'nexus'

export const FooObject = objectType({
  name: 'Foo',
  definition(t) {
    t.nonNull.id('id')
    t.nonNull.string('handle')
  },
})

export const BusinessErrorResourceNotFound = objectType({
  name: 'BusinessErrorResourceNotFound',
  definition(t) {
    t.nonNull.string('message')
  },
})

export const BusinessErrorHandleAlreadyTaken = objectType({
  name: 'BusinessErrorHandleAlreadyTaken',
  definition(t) {
    t.nonNull.string('message')
  },
})
