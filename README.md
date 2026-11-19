# Ticket Booth API — A sample solution

The fixed version of the security quiz. Every change is marked with a `// FIX:` comment.

```bash
npm install
npm test           # features.test.ts (normal use) + security.test.ts (every Part A attack)
npm run dev        # http://localhost:3000
```

`test/security.test.ts` replays every attack from Part A. To grade a submission, copy it into
the student's `test/` folder and run `npm test`: all 26 tests should pass. On the unmodified
starter, the 18 security tests (and the apostrophe feature test) fail.

## What changed

| File | Fix | Lecture idea |
|------|-----|--------------|
| `src/domain/parse.ts` | `parseBookingRequest(json: unknown): BookingRequest`. Checks type and range of every field; the returned type has **no `price`** | Parse, don't validate |
| `src/controllers/bookingController.ts` | Price comes from `EventModel.findById`, not the body. Guard `!(total >= 0 && total <= subtotal)`. Booking id is parsed (`400` if not a positive integer) | The client sends choices, the server owns facts; fail closed |
| `src/domain/promos.ts` | `Map` instead of a plain object; unknown code throws `ValidationError` | Fail closed |
| `src/models/eventModel.ts` | `ILIKE '%' \|\| $1 \|\| '%'` with `[q]` | Parameterized queries |
| `src/models/userModel.ts` | `name = $1 AND password_hash = crypt($2, password_hash)` | Parameterized queries |
| `src/models/bookingModel.ts` | `id = $1`, and `id` is now a `number` | Parameterized queries |
| `src/controllers/authController.ts` | `name` and `password` must be strings (`400` otherwise) | Parse at the boundary |

---

## Quiz write-up (answer key)

Outputs below are real responses from the starter code.

### Part A — attacks

| # | Request | What came back | Bug |
|---|---------|----------------|-----|
| A0 | `npm test`: `a search with an apostrophe is just text` fails. `GET /api/events?q=Rock 'n' Roll` | `500 syntax error at or near "n"` | `EventModel.search` pastes `q` into the SQL text. The apostrophe in the data ended the SQL string, so the rest was read as SQL. Same bug as A4 |
| A1 | `POST /api/bookings` `{"eventId":3,"customer":"mallory@example.edu","qty":2,"price":0.01}` | `201 … "total":0.02` (a $40 ticket) | `BookingController.create` multiplies by `body.price`: the client decides what a ticket costs |
| A2 | `{"eventId":3,…,"qty":-2,"price":40}` | `201 … "qty":-2,"total":-80` (a refund) | `req.body as BookingRequest` checks nothing at run time; `qty` is never range-checked |
| A2 | `{"eventId":3,…,"qty":2,"price":40,"promo":"BOGUS"}` (or `"toString"`) | `201 … "total":null` | `PROMOS["BOGUS"]` is `undefined` (and `PROMOS["toString"]` is an inherited function), so the total is `NaN`, stored, and sent as `null`. The lookup fails **open** |
| A3 | `POST /api/login` `{"name":"alice' --","password":"x"}` | `200 welcome, alice … "role":"admin"` | `UserModel.login`: `--` comments out the password check |
| A4 | `GET /api/events?q=zzz' UNION SELECT id, name, password_hash, 0 FROM users --` (first tries: `each UNION query must have the same number of columns`, then `UNION types integer and text cannot be matched`) | every user's name and bcrypt hash in the `title` / `venue` fields | `EventModel.search`: the search text becomes part of the query |
| A5 | `GET /api/bookings/0 OR 1=1` | every booking, with every customer's email | `BookingModel.findById`: numeric injection, no quotes needed |

### Part C — questions

1. **Escaping instead of parameters.** `replaceAll("'", "''")` would stop A0, A3 and A4,
   because those payloads have to close a quoted string. It does **not** stop A5:
   `WHERE id = ${id}` has no quotes around it, and `0 OR 1=1` contains no quote to escape.
   Escaping depends on where the value lands in the SQL; a parameter is never SQL text at all,
   wherever it goes.

2. **Why `as BookingRequest` did not help.** `as` is a compile-time promise that tsc erases;
   the JavaScript that runs is just `const body = req.body`. JSON can carry any type, so
   `qty` can arrive as `-2`, `"3"` or `2.5`. Only code that runs (the parser) can check it,
   and once `parseBookingRequest` returns a `BookingRequest` the type is true.

3. **Fail closed.** For an input the code did not plan for, it should refuse (throw, `400`),
   not carry on with a default. Before the fix, an unknown promo produced `NaN` and the booking
   went through. Now `discountRate` throws for any code not in the `Map`, and the guard
   `!(total >= 0 && total <= subtotal)` stops any total that is negative, larger than the
   subtotal, or `NaN` (every comparison with `NaN` is false), even from a bug we have not
   found yet.
