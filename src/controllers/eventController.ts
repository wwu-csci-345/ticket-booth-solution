import type { Request, Response, NextFunction } from 'express';
import { EventModel } from '../models/eventModel';
import { notFound } from '../errors';
import { view } from '../views/jsonView';

/** CONTROLLER for events. */
export const EventController = {
  /** GET /api/events?q=jazz */
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const q = String(req.query.q ?? '');
      view.ok(res, await EventModel.search(q));
    } catch (err) {
      next(err);
    }
  },

  /** GET /api/events/:id */
  async show(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await EventModel.findById(Number(req.params.id));
      if (!event) throw notFound('Event');
      view.ok(res, event);
    } catch (err) {
      next(err);
    }
  },
};
