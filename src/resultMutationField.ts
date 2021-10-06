import * as Nexus from 'nexus'
import { resultFieldDo } from '~core'

export interface ResultMutationFieldConfig<FieldName extends string = any> {
  /**
   * The success-case type returned by this mutation resolver. This type will be wrapped in the result type which in
   * turn becomes the actual mutation field type.
   *
   * Because this type will be in a union it _must_ be an Object type as per the GraphQL spec.
   */
  successType: Nexus.core.GetGen<'objectNames'> | Nexus.core.NexusObjectTypeDef<any>
  /**
   * The types of errors that this mutation may return.
   *
   * The list may contain a mix of either Object type reference _or_ Object type definitions. If definitions given
   * they will be added to the GraphQL schema for you (via being included in the returned array of this function
   * call).
   */
  errorTypes: (Nexus.core.GetGen<'objectNames'> | Nexus.core.NexusObjectTypeDef<any>)[]
  /**
   * The input for this mutation.
   *
   * May be an InputObject type reference _or_ definition. If definition given, then the automatically created
   * InputObject name is `${mutation field name}Input`.
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
   * The resolver for this mutation field.
   */
  resolve: Nexus.core.FieldResolver<'Mutation', FieldName>
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
 * Create a mutation field with a result-style return type that captures the set of possible errors that can
 * happpen for this mutation.
 *
 * @param -  The name of this mutation field.
 * @param -  Configuration For this mutation field.
 * @returns A list of Nexus type definitions ready to be handed over to `makeSchema`.
 */
export const resultMutationField = <FieldName extends string>(
  name: FieldName,
  config: ResultMutationFieldConfig<FieldName>
) => resultFieldDo(name, { ...config, rootObjectType: 'Mutation' })
