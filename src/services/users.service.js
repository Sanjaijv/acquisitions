import logger from "#config/logger.js";
import { db } from "#config/database.js";
import { eq } from "drizzle-orm";
import { users } from "../db/schema/users.js";

export const getAllUsers = async () => {
  try {
    return await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users);
  } catch (e) {
    logger.error("Error getting users", e);
    throw e;
  }
};

export const getUserById = async (id) => {
  try {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user || null;
  } catch (e) {
    logger.error("Error getting user by id", e);
    throw e;
  }
};

export const updateUser = async (id, updates) => {
  try {
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existingUser) {
      throw new Error("User not found");
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    logger.info(`User ${updatedUser.email} updated successfully`);
    return updatedUser;
  } catch (e) {
    logger.error("Error updating user", e);
    throw e;
  }
};

export const deleteUser = async (id) => {
  try {
    const [existingUser] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existingUser) {
      throw new Error("User not found");
    }

    await db.delete(users).where(eq(users.id, id));

    logger.info(`User ${existingUser.email} deleted successfully`);
    return existingUser;
  } catch (e) {
    logger.error("Error deleting user", e);
    throw e;
  }
};
