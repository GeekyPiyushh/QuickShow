# QuickShow admin upgrade

## Run locally (Windows / VS Code / Antigravity)

Extract this project into a new folder. Keep your original folder as a backup.
Copy your existing `.env` values into this project's root `.env`; secrets are not included in this download. `.env.example` lists the expected settings.

Install once from the project root:

```sh
npm install
npm install --prefix server
```

For the simplest college demonstration, set `STORAGE_MODE=file` in the root `.env`.
This uses the supplied `server/data/db.json`, preserves its existing records, and saves edits atomically to that file. Keep this file when updating your project.

Terminal 1 (project root):

```sh
npm run server
```

Terminal 2 (project root):

```sh
npm run dev
```

Open the Vite address shown in the terminal, then `/admin`. Sign in with your existing administrator account. Public registration can no longer grant admin privileges. The original seed accounts apply only to a fresh data file; no new account is added to your existing data.

## What changed

- Responsive dark admin workspace with desktop sidebar and mobile navigation.
- Real dashboard totals, date filters, a seven-day booking chart, popular movies and recent reservations. Zero stays zero; API failures display errors.
- Separate active booking value and recorded paid amount. New reservations are unpaid; this project does not process payments or refunds.
- Movie create/edit/archive, status/language/genre/duration/rating/poster/trailer fields, search and pagination.
- Show creation with theatre and screen selectors, IST dates/times, pricing and turnaround buffer; backend blocks overlaps including midnight crossings.
- Show edits are blocked if seats are reserved. Cancelling a future show cancels linked reservations while preserving history.
- Booking search, status/date filters, sorting, details, cancellation and filtered CSV export (spreadsheet formula escaping included).
- Seat occupancy map using the screen's capacity, with nine seats per row consistently on customer and admin pages.
- Customer directory and booking history.
- Customer checkout now submits a real show ID. The server validates seats and prices and rejects duplicate reservations. Failed requests no longer generate fake success tickets.
- Public screening dates and seat availability come from the backend.
- Frontend hardcoded admin sign-in buttons removed. Backend verifies the current stored user's role.

## Storage and existing data

Use one backend process for this college project. All writes are queued inside that process. Do not run multiple Node workers against the same JSON file or database with this in-memory store design.

With `STORAGE_MODE=file`, MongoDB is not used. No database connection is needed.
With `MONGODB_URI` set and `STORAGE_MODE` not `file`, MongoDB is authoritative. **MongoDB must support transactions: use Atlas or a replica set.** A standalone local MongoDB instance is not supported by the transactional write path. Select file mode for a local demonstration or configure a replica set.

When MongoDB is completely empty, the existing JSON data is imported once. A non-empty MongoDB database is loaded as-is; an empty collection remains empty. There is no silent fallback on a database outage, and no background write whose failure is hidden behind a success response. Keep a backup before switching storage modes; file and MongoDB modes are separate datasets.

Legacy records are preserved. Some older bookings have no real show ID; their details can be viewed but automatic cancellation is refused because seats cannot safely be mapped. Existing recorded `isPaid` flags remain visible and are not proof of a payment gateway transaction. Cancelling a paid record marks it for refund review, not refunded.

Shows with existing future bookings cannot be edited. Movie duration cannot change while future shows exist. Archive a movie only after cancelling its future shows. There is no hard deletion of booking history.

## Validation

```sh
npm run build
npm run test:admin
npm run lint:admin
```

`test:admin` starts a separate server on port 3197, uses a temporary database and deletes it afterwards. It checks authorization, role escalation, movie changes, future scheduling, screen matching, midnight overlaps, turnaround, seat validation, concurrent bookings, cancellation, seat release, public/customer consistency, restart persistence and empty datasets. It does not touch your data.

Verified here: production build, targeted lint, 26 backend checks, and browser checks for login, movies, bookings, CSV, customers and responsive layout.

MongoDB transactions require your configured database and have not been integration-tested in this environment. The existing application has unrelated legacy lint findings; `lint:admin` targets the new admin, screening and API files.

## Suggested review demonstration

1. Sign in at `/admin`; explain booking count versus booking value.
2. Add a movie and edit its language or rating.
3. Schedule a future show on a chosen theatre/screen.
4. Attempt an overlapping show and demonstrate the validation message.
5. Open the movie as a customer, choose the real date, reserve seats and see the ticket.
6. Return as admin; search the booking, inspect its details and seat map.
7. Cancel the booking, verify the seats become available, and export the filtered list.
8. Refresh/restart to demonstrate persistence.

## Scope

Included: dashboard, movies, shows, bookings, occupancy, customers and CSV export.
Not included: theatre/screen CRUD, discount coupons, real payment/refund processing, news CMS, or an audit log. Existing theatre/screen records are selectable. These can be added as subsequent milestones.
