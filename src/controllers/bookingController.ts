import type { Request, Response, NextFunction } from 'express';
import { EventModel } from '../models/eventModel';
import { BookingModel } from '../models/bookingModel';
import { discountRate } from '../domain/promos';
import { parseBookingRequest } from '../domain/parse';
import { notFound, ValidationError } from '../errors';
import { view } from '../views/jsonView';

/** CONTROLLER for bookings. */
export const BookingController = {
  /** POST /api/bookings  { "eventId": 1, "customer": "erin@example.edu", "qty": 2, "promo"?: "STUDENT" } */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const order = parseBookingRequest(req.body);         // FIX: parse at the boundary

      const event = await EventModel.findById(order.eventId);
      if (!event) throw notFound('Event');

      const subtotal = event.price * order.qty;             // FIX: the server owns the price
      const total = subtotal * discountRate(order.promo);   // FIX: unknown code throws
      if (!(total >= 0 && total <= subtotal)) {             // FIX: last guard; NaN fails it too
        throw new Error('total out of range');
      }

      const booking = await BookingModel.create({
        eventId: event.id,
        customer: order.customer,
        qty: order.qty,
        total,
      });
      view.created(res, booking);
    } catch (err) {
      next(err);
    }
  },

  /** GET /api/bookings/:id */
  async show(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);                     // FIX: parse the id too
      if (!Number.isInteger(id) || id < 1) throw new ValidationError('booking id must be a positive integer');
      const rows = await BookingModel.findById(id);
      if (rows.length === 0) throw notFound('Booking');
      view.ok(res, rows);
    } catch (err) {
      next(err);
    }
  },
};
