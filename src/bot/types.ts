import { Context } from 'grammy';
import { UserSession } from '../types';

export interface RadaContext extends Context {
  session: UserSession;
}
