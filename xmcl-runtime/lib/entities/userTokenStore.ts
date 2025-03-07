import { UserProfile } from '@xmcl/runtime-api'
import { InjectionKey } from '../util/objectRegistry'

export const kUserTokenStorage: InjectionKey<UserTokenStorage> = Symbol('UserTokenStorage')

export interface UserTokenStorage {
  get(user: Pick<UserProfile, 'authService' | 'id'>): Promise<string | undefined>
  put(user: UserProfile, token: string): Promise<void>
}
