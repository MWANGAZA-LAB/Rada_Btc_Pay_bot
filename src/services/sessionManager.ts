import { createClient } from 'redis';
import { UserSession } from '../types';
import logger from '../utils/logger';
import { config } from '../config';

class SessionManager {
  private redis: ReturnType<typeof createClient> | null = null;
  private memoryStore: Map<number, UserSession> = new Map();

  async initialize(): Promise<void> {
    try {
      if (config.redis.url) {
        this.redis = createClient({ url: config.redis.url });
        await this.redis.connect();
        logger.info('Redis connected successfully');
      } else {
        logger.info('Using in-memory session storage');
      }
    } catch (error) {
      logger.error('Failed to connect to Redis, using in-memory storage:', error);
    }
  }

  async getSession(userId: number): Promise<UserSession | null> {
    try {
      if (this.redis) {
        const sessionData = await this.redis.get(`session:${userId}`);
        return sessionData ? JSON.parse(sessionData) : null;
      } else {
        return this.memoryStore.get(userId) || null;
      }
    } catch (error) {
      logger.error('Error getting session:', error);
      return null;
    }
  }

  async setSession(userId: number, session: UserSession): Promise<void> {
    try {
      const updatedSession = {
        ...session,
        updatedAt: new Date(),
      };

      if (this.redis) {
        await this.redis.setEx(
          `session:${userId}`,
          3600, // 1 hour expiry
          JSON.stringify(updatedSession)
        );
      } else {
        this.memoryStore.set(userId, updatedSession);
      }
    } catch (error) {
      logger.error('Error setting session:', error);
    }
  }

  async updateSession(userId: number, updates: Partial<UserSession>): Promise<void> {
    try {
      const existingSession = await this.getSession(userId);
      if (existingSession) {
        const updatedSession = {
          ...existingSession,
          ...updates,
          updatedAt: new Date(),
        };
        await this.setSession(userId, updatedSession);
      }
    } catch (error) {
      logger.error('Error updating session:', error);
    }
  }

  async clearSession(userId: number): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.del(`session:${userId}`);
      } else {
        this.memoryStore.delete(userId);
      }
    } catch (error) {
      logger.error('Error clearing session:', error);
    }
  }

  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}

export const sessionManager = new SessionManager();
