import logger from '#config/logger.js';
import { db } from '#config/database.js';
import { users } from '../db/schema/users.js';
import { eq } from 'drizzle-orm';

export const fetchAllUsers = async (req, res, next) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users);

    res.status(200).json({
      message: 'Users retrieved successfully',
      users: allUsers
    });
  } catch (e) {
    logger.error('Error fetching users:', e);
    next(e);
  }
};

export const fetchUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, parseInt(id)))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'User retrieved successfully',
      user
    });
  } catch (e) {
    logger.error('Error fetching user by ID:', e);
    next(e);
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.createdAt;

    const [updatedUser] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(users.id, parseInt(id)))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (e) {
    logger.error('Error updating user:', e);
    next(e);
  }
};

export const deleteUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, parseInt(id)))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role
      });

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'User deleted successfully',
      user: deletedUser
    });
  } catch (e) {
    logger.error('Error deleting user:', e);
    next(e);
  }
};