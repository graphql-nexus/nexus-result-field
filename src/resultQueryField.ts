import * as Nexus from 'nexus'
import { resultFieldDo } from '~core'

export interface ResultQueryFieldConfig<FieldName extends string = any> {
  /**
   * The success-case type returned by this query resolver. This type will be wrapped in the result type which in turn
   * becomes the actual query field type.
   *
   * Because this type will be in a union it _must_ be an Object type as per the GraphQL spec.
   */
  successType: Nexus.core.GetGen<'objectNames'> | Nexus.core.NexusObjectTypeDef<any>
  /**
   * The types of errors that this query may return.
   *
   * The list may contain a mix of either Object type reference _or_ Object type definitions. If definitions given
   * they will be added to the GraphQL schema for you (via being included in the returned array of this function
   * call).
   */
  errorTypes: (Nexus.core.GetGen<'objectNames'> | Nexus.core.NexusObjectTypeDef<any>)[]
  /**
   * The input for this query.
   *
   * May be an InputObject type reference _or_ definition. If definition given, then the automatically created
   * InputObject name is `${query field name}Input`.
   *
   * Made available on `args` under the `input` key.
   *
   * Optional but generally use this, as a good GraphQL API has as few idiosyncracies as possible.
   */
  input?: Nexus.core.GetGen<'allInputTypes'> | Nexus.core.NexusInputObjectTypeConfig<string>['definition']
  /**
   * Custom arguments to add to this query field.
   *
   * Warning: if `input` given it will overwrite the `input` from this configuration.
   */
  args?: Nexus.core.ArgsRecord
  /**
   * The resolver for this query field.
   */
  resolve: Nexus.core.FieldResolver<'Query', FieldName>
  /**
   * Can this mutation return multiple errors at a time?
   *
   * When enabled additional type definitions are added to the GraphQL schema to support returning multiple
   * errors.
   * Since the GraphQL spec does not support putting arrays into unions it requires a new wrapper object to
   * house a list of errors.
   *
   * @default false
   */
  aggregateErrors?: boolean
  /**
   * The type name prefix to use. By default is the given field name capitalized (first character).
   *
   * Generally use this sparingly as a good GraphQL API has as few idiosyncracies as possible.
   */
  typeNamePrefix?: string
}

/**
 * Create a query field with a result-style return type that captures the set of possible errors that can
 * happpen for this query.
 *
 * @param -  The name of this query field.
 * @param -  Configuration For this query field.
 * @returns A list of Nexus type definitions ready to be handed over to `makeSchema`.
 */
export const resultQueryField = <FieldName extends string>(
  name: FieldName,
  config: ResultQueryFieldConfig<FieldName>
) => resultFieldDo(name, { ...config, rootObjectType: 'Query' })
