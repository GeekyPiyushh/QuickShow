const { spawn } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const assert = require("node:assert/strict");
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "quickshow-admin-"));
const port = 3197;
let server;
function start() {
  server = spawn(process.execPath, [path.join(__dirname, "server.js")], {
    cwd: path.join(__dirname, ".."),
    env: {
      ...process.env,
      PORT: String(port),
      STORAGE_MODE: "file",
      DATA_FILE: path.join(dir, "db.json"),
      NODE_ENV: "test",
      JWT_SECRET: "test-only-random-secret",
    },
  });
  server.stderr.on("data", () => {});
  return new Promise((resolve, reject) => {
    const t = setTimeout(
      () => reject(new Error("Server startup timed out")),
      10000,
    );
    server.stdout.on("data", (b) => {
      if (String(b).includes("listening")) {
        clearTimeout(t);
        resolve();
      }
    });
    server.on("exit", (c) => {
      if (c) reject(new Error("Server exited " + c));
    });
  });
}
async function stop() {
  if (!server || server.exitCode !== null) return;
  const p = new Promise((r) => server.once("exit", r));
  server.kill();
  await p;
}
let checks = 0;
function check(value, msg) {
  assert.ok(value, msg);
  checks++;
  console.log("PASS " + msg);
}
async function req(route, method = "GET", body, token) {
  const r = await fetch(`http://127.0.0.1:${port}/api${route}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { ...(await r.json()), http: r.status };
}
(async () => {
  try {
    await start();
    const admin = await req("/auth/login", "POST", {
      email: "admin@example.com",
      password: "admin123",
    });
    const user = await req("/auth/login", "POST", {
      email: "piyush@example.com",
      password: "password123",
    });
    const a = admin.token,
      u = user.token;
    check(a && u, "Existing admin and customer sign-in");
    check(
      (await req("/admin/data")).http === 401,
      "Anonymous admin access denied",
    );
    check(
      (await req("/admin/data", "GET", null, u)).http === 403,
      "Customer admin access denied",
    );
    check(
      (
        await req("/auth/register", "POST", {
          name: "Intruder",
          email: "x@example.test",
          password: "longpassword",
          role: "admin",
        })
      ).http === 403,
      "Public admin role escalation denied",
    );
    const movie = (
      await req(
        "/movies",
        "POST",
        {
          title: "Test Screening",
          duration: 120,
          rating: 0,
          status: "now_showing",
          language: "Hindi",
          genre: ["Drama"],
        },
        a,
      )
    ).movie;
    check(
      movie && movie.rating === 0,
      "Movie creation preserves a zero rating",
    );
    let res = await req(
      "/admin/movies/" + movie._id,
      "PUT",
      { title: "Updated Screening" },
      a,
    );
    check(res.movie?.title === "Updated Screening", "Movie edit persisted");
    const date = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
      next = new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10);
    const input = {
      movie: movie._id,
      theatre: "th_01",
      screen: "sc_01",
      showDate: date,
      startTime: "23:00",
      price: 350,
      turnaroundMinutes: 15,
    };
    const show = (await req("/shows", "POST", input, a)).show;
    check(!!show, "Show created with chosen screen and theatre");
    check(
      (await req("/shows", "POST", { ...input, screen: "sc_03" }, a)).http ===
        400,
      "Mismatched screen/theatre rejected",
    );
    check(
      (
        await req(
          "/shows",
          "POST",
          { ...input, showDate: next, startTime: "00:30" },
          a,
        )
      ).http === 409,
      "Cross-midnight overlap rejected",
    );
    check(
      (
        await req(
          "/shows",
          "POST",
          { ...input, showDate: next, startTime: "01:10" },
          a,
        )
      ).http === 409,
      "Turnaround buffer enforced",
    );
    check(
      (
        await req(
          "/shows",
          "POST",
          { ...input, showDate: next, startTime: "01:15" },
          a,
        )
      ).http === 201,
      "Adjacent show allowed at buffer boundary",
    );
    check(
      (
        await req(
          "/bookings",
          "POST",
          { show: show._id, seats: ["A1", "A1"] },
          u,
        )
      ).http === 400,
      "Duplicate seats rejected",
    );
    check(
      (await req("/bookings", "POST", { show: show._id, seats: ["Z999"] }, u))
        .http === 400,
      "Out-of-layout seats rejected",
    );
    const results = await Promise.all([
      req(
        "/bookings",
        "POST",
        { show: { _id: show._id, price: 1 }, seats: ["A1", "A2"] },
        u,
      ),
      req("/bookings", "POST", { show: show._id, seats: ["A1"] }, u),
    ]);
    check(
      results.filter((r) => r.http === 201).length === 1 &&
        results.filter((r) => r.http === 409).length === 1,
      "Concurrent seat reservation allows only one winner",
    );
    const booking = results.find((r) => r.http === 201).booking;
    check(
      booking.totalAmount === booking.seats.length * 350 && !booking.isPaid,
      "Server calculates amount and does not invent payment",
    );
    check(
      (await req("/admin/shows/" + show._id, "PUT", { price: 400 }, a)).http ===
        409,
      "Booked show edit blocked",
    );
    check(
      (
        await req(
          "/admin/movies/" + movie._id,
          "PUT",
          { status: "archived" },
          a,
        )
      ).http === 409,
      "Movie with future shows cannot be archived",
    );
    const cancel = await req(
      "/admin/bookings/" + booking._id + "/cancel",
      "POST",
      {},
      a,
    );
    check(
      cancel.booking?.status === "cancelled",
      "Cancellation status persisted",
    );
    check(
      (await req("/shows/" + show._id + "/seats")).bookedSeats.length === 0,
      "Cancellation releases reserved seats",
    );
    check(
      (await req("/admin/bookings/" + booking._id + "/cancel", "POST", {}, a))
        .http === 200,
      "Repeated cancellation is idempotent",
    );
    const rebook = await req(
      "/bookings",
      "POST",
      { show: show._id, seats: ["A1"] },
      u,
    );
    check(rebook.http === 201, "Released seat can be booked again");
    check(
      (await req("/admin/shows/" + show._id + "/cancel", "POST", {}, a))
        .http === 200,
      "Show cancellation succeeds",
    );
    check(
      (await req("/bookings/my", "GET", null, u)).bookings.find(
        (b) => b._id === rebook.booking._id,
      ).status === "cancelled",
      "Show cancellation updates customer history",
    );
    check(
      !(await req("/shows")).shows.some((s) => s._id === show._id),
      "Cancelled shows hidden from public listings",
    );
    await stop();
    await start();
    check(
      (await req("/admin/data", "GET", null, a)).bookings.find(
        (b) => b._id === booking._id,
      ).status === "cancelled",
      "Changes survive server restart",
    );
    const file = JSON.parse(fs.readFileSync(path.join(dir, "db.json")));
    file.bookings = [];
    fs.writeFileSync(path.join(dir, "db.json"), JSON.stringify(file));
    await stop();
    await start();
    check(
      (await req("/admin/data", "GET", null, a)).bookings.length === 0,
      "Empty booking data stays empty without dummy fallback",
    );
    console.log(
      `\n${checks} checks passed. Isolated local storage; no live data changed.`,
    );
  } finally {
    await stop();
    fs.rmSync(dir, { recursive: true, force: true });
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
