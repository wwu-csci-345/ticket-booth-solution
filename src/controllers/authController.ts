import type { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/userModel';
import { HttpError, ValidationError } from '../errors';
import { view } from '../views/jsonView';

/** CONTROLLER for logging in. (A real app would also start a session.) */
export const AuthController = {
  /** POST /api/login  { "name": "bob", "password": "..." } */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, password } = (req.body ?? {}) as Record<string, unknown>;
      if (typeof name !== 'string' || typeof password !== 'string') {
        throw new ValidationError('name and password must be strings');
      }
      const user = await UserModel.login(name, password);
      if (!user) throw new HttpError(401, 'wrong name or password');
      view.ok(res, { message: `welcome, ${user.name}`, user });
    } catch (err) {
      next(err);
    }
  },
};
