import { extendType, inputObjectType, list, nonNull, objectType, unionType } from 'nexus'
import { upperFirst } from '~helpers'
import { ResultMutationFieldConfig } from '~resultMutationField'
import { ResultQueryFieldConfig } from '~resultQueryField'

/**
 * Core logic for all public result-field functions.
 */
export const resultFieldDo = (
  name: string,
  {
    successType,
    resolve,
    input,
    args,
    errorTypes,
    aggregateErrors = false,
    typeNamePrefix,
    rootObjectType,
  }: (ResultMutationFieldConfig | ResultQueryFieldConfig) & {
    rootObjectType: 'Mutation' | 'Query'
  }
): any[] => {
  const typeNamePrefix_ = typeNamePrefix ?? upperFirst(name)
  const typeNameResult = `${typeNamePrefix_}Result`
  const typeNameErrorAggregate = `${typeNamePrefix_}Errors`
  const typeNameError = `${typeNamePrefix_}Error`
  const successTypeName = (typeof successType === 'string' ? successType : successType.name) as string
  const errorTypeNameReferences = errorTypes.map((error) => {
    // Get the name from any _definitions_ given
    return (typeof error === 'string' ? error : error.name) as string
  })
  const inputReference = typeof input === 'string' ? input : `${typeNamePrefix_}Input`
  const conventionArgs = input
    ? {
        input: nonNull(inputReference as any),
      }
    : {}
  const args_ = { ...conventionArgs, ...args }

  const types: any[] = [
    extendType({
      type: rootObjectType,
      definition(t) {
        t.field(name, {
          type: typeNameResult as any,
          args: args_ as any,
          resolve: resolve as any,
        })
      },
    }),
    unionType({
      name: typeNameResult,
      definition(t) {
        const aggregateErrorOrInlineErrors = aggregateErrors
          ? [typeNameErrorAggregate]
          : errorTypeNameReferences
        // eslint-disable-next-line
        t.members(successTypeName, ...(aggregateErrorOrInlineErrors as any))
      },
    }),
  ]

  // Add error type object-references if any
  // For convenience in case the user is using writing Nexus type defs inline

  // eslint-disable-next-line
  types.push(...(errorTypes.filter((error) => typeof error !== 'string') as any))

  // Add result type object-reference if being used
  // For convenience in case the user is using writing Nexus type defs inline

  if (typeof successType !== 'string') {
    types.push(successType)
  }

  // Add aggregate error structure if enabled

  if (aggregateErrors) {
    types.push(
      objectType({
        name: typeNameErrorAggregate,
        isTypeOf(model) {
          return 'errors' in model
        },
        definition(t) {
          t.field('errors', {
            type: nonNull(list(nonNull(typeNameError as any))),
          })
        },
      }),
      unionType({
        name: typeNameError,
        definition(t) {
          t.members(...errorTypeNameReferences)
        },
      })
    )
  }

  // Add inline input-type definition if any

  if (input && typeof input !== 'string') {
    types.push(
      inputObjectType({
        name: inputReference,
        definition(t) {
          input(t)
        },
      })
    )
  }

  return types
}
