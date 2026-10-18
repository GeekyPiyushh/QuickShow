import { cloneElement, useId, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  RefreshCw,
  Download,
  Pencil,
  Eye,
  X,
  Ticket,
  IndianRupee,
  CalendarDays,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import { adminRequest, createMovie, createShow } from "../../lib/api";
const money = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);
const date = (s) =>
  s
    ? new Date(s).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
const status = (b) => b.status || "confirmed";
const seats = (b) =>
  (b.bookedSeats || b.seats || []).map((s) => s.seatNumber || s);
const id = (x) => String(x?._id ?? x ?? "");
import { showStart } from "../../lib/showStart";

function Badge({ value }) {
  return (
    <span className={"a-badge " + value}>
      {String(value).replaceAll("_", " ")}
    </span>
  );
}
function Modal({ title, onClose, children }) {
  const ref = useRef();
  useEffect(() => {
    const el = ref.current;
    el.showModal();
    return () => el.close();
  }, []);
  return (
    <dialog className="a-modal" ref={ref} aria-label={title} onCancel={onClose}>
      <div className="a-modal-head">
        <h2>{title}</h2>
        <button className="a-btn" aria-label="Close dialog" onClick={onClose}>
          <X size={16} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
function Field({ label, wide, children }) {
  const fieldId = useId();
  return <div className={"a-field " + (wide ? "wide" : "")}><label htmlFor={fieldId}>{label}</label>{cloneElement(children,{id:fieldId})}</div>;
}

function Empty({
  title = "Nothing here yet",
  text = "Try adjusting your filters, or add your first record.",
}) {
  return (
    <div className="a-empty">
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}
const initialMovie = {
  title: "",
  description: "",
  genre: "Action",
  language: "English",
  duration: 120,
  rating: 0,
  releaseDate: "",
  poster: "",
  trailer: "",
  status: "now_showing",
};
export default function AdminWorkspace(props) {
  return <Workspace key={props.view + String(props.initialAdd)} {...props} />;
}
function Workspace({ view = "dashboard", initialAdd = false }) {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("all"),
    [from, setFrom] = useState(""),
    [to, setTo] = useState(""),
    [page, setPage] = useState(1),
    [sort, setSort] = useState("newest"),
    [modal, setModal] = useState(() =>
      initialAdd
        ? { kind: view === "movies" ? "movie" : "show", item: null }
        : null,
    ),
    [busy, setBusy] = useState(false),
    [formError, setFormError] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      setData(await adminRequest());
      setNow(Date.now());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    let live = true;
    adminRequest()
      .then((d) => {
        if (live) {
          setData(d);
          setNow(Date.now());
        }
      })
      .catch((e) => {
        if (live) setError(e.message);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, []);

  const open = (kind, item = null) => {
    setFormError("");
    setModal({ kind, item });
  };
  async function act(path, method, body) {
    setBusy(true);
    setFormError("");
    try {
      await adminRequest(path, method, body);
      setModal(null);
      toast.success("Changes saved");
      await load();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const titles = {
    dashboard: [
      "Overview",
      "A clear picture of your cinema, all in one place.",
    ],
    movies: ["Movies", "Curate your catalogue and manage upcoming releases."],
    shows: [
      "Shows",
      "Schedule screenings, manage pricing and monitor occupancy.",
    ],
    bookings: [
      "Bookings",
      "Find reservations, review details and manage cancellations.",
    ],
    customers: ["Customers", "Your audience and their booking history."],
  };
  const [title, subtitle] = titles[view];
  const inRange = (b) => {
    const d = String(b.createdAt || b.bookedAt || "").slice(0, 10);
    return (!from || d >= from) && (!to || d <= to);
  };
  const allBookings = data?.bookings || [],
    rangeBookings = allBookings.filter(inRange),
    confirmed = rangeBookings.filter((b) => status(b) !== "cancelled");
  const upcoming = (data?.shows || []).filter(
    (s) => s.status !== "cancelled" && showStart(s) > now,
  );
  let rows =
    view === "movies"
      ? data?.movies || []
      : view === "shows"
        ? data?.shows || []
        : view === "bookings"
          ? allBookings
          : data?.users || [];
  rows = rows.filter((x) => {
    const q = query.trim().toLowerCase();
    const text =
      view === "movies"
        ? [x.title, x.language]
        : view === "shows"
          ? [x.movie?.title, x.theatre?.name, x.screen?.name]
          : view === "bookings"
            ? [
                x.bookingId,
                x._id,
                x.user?.name,
                x.user?.email,
                x.show?.movie?.title,
              ]
            : [x.name, x.email];
    if (q && !text.join(" ").toLowerCase().includes(q)) return false;
    if (view === "bookings" && !inRange(x)) return false;
    if (filter === "all") return true;
    return view === "movies"
      ? x.status === filter
      : view === "bookings"
        ? status(x) === filter
        : view === "shows"
          ? filter === "upcoming"
            ? x.status !== "cancelled" && showStart(x) > now
            : filter === "past"
              ? x.status !== "cancelled" && showStart(x) <= now
              : x.status === filter
          : true;
  });
  rows = [...rows].sort((a, b) =>
    sort === "name"
      ? String(
          a.title || a.movie?.title || a.user?.name || a.name || "",
        ).localeCompare(
          String(b.title || b.movie?.title || b.user?.name || b.name || ""),
        )
      : sort === "amount"
        ? Number(b.totalAmount || b.price || 0) -
          Number(a.totalAmount || a.price || 0)
        : String(b.createdAt || "").localeCompare(String(a.createdAt || "")),
  );
  const totalPages = Math.max(1, Math.ceil(rows.length / 8)),
    currentPage = Math.min(page, totalPages),
    shown = rows.slice((currentPage - 1) * 8, currentPage * 8);
  function exportCsv() {
    const csvCell = (x) => {
      let s = String(x ?? "");
      if (/^[=+@\-\t\r\n]/.test(s)) s = "'" + s;
      return '"' + s.replaceAll('"', '""') + '"';
    };
    const table = [
      [
        "Booking ID",
        "Customer",
        "Email",
        "Movie",
        "Show date",
        "Seats",
        "Amount INR",
        "Status",
        "Paid",
        "Refund status",
      ],
      ...rows.map((b) => [
        b.bookingId || b._id,
        b.user?.name,
        b.user?.email,
        b.show?.movie?.title,
        b.show?.showDate,
        seats(b).join(" "),
        b.totalAmount,
        status(b),
        b.isPaid ? "Yes" : "No",
        b.refundStatus || "",
      ]),
    ];
    const url = URL.createObjectURL(
      new Blob(
        ["\ufeff" + table.map((r) => r.map(csvCell).join(",")).join("\r\n")],
        { type: "text/csv;charset=utf-8" },
      ),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "quickshow-bookings.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const filters =
    view === "movies"
      ? ["now_showing", "coming_soon", "archived"]
      : view === "shows"
        ? ["upcoming", "past", "cancelled"]
        : ["confirmed", "cancelled"];
  return (
    <>
      <header className="admin-heading">
        <div>
          <p className="a-muted">YOUR CINEMA, UNDER CONTROL</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="a-actions">
          <button
            className="a-btn"
            onClick={load}
            disabled={loading}
            aria-label="Refresh data"
          >
            <RefreshCw />
          </button>
          {["movies", "shows"].includes(view) && (
            <button
              className="a-btn primary"
              onClick={() => open(view === "movies" ? "movie" : "show")}
            >
              <Plus />
              Add {view === "movies" ? "movie" : "show"}
            </button>
          )}
        </div>
      </header>
      {error && (
        <p className="a-error" role="alert">
          {error}{" "}
          <button className="a-btn" onClick={load}>
            Retry
          </button>
        </p>
      )}
      {loading && !data ? (
        <Empty
          title="Loading your workspace…"
          text="Fetching the latest records."
        />
      ) : (
        data && (
          <>
            {view === "dashboard" ? (
              <>
                <div className="a-tools">
                  <label className="a-muted">Booking period</label>
                  <input
                    aria-label="Bookings from date"
                    type="date"
                    className="a-input"
                    value={from}
                    max={to || undefined}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                  <span className="a-muted">to</span>
                  <input
                    aria-label="Bookings to date"
                    type="date"
                    className="a-input"
                    value={to}
                    min={from || undefined}
                    onChange={(e) => setTo(e.target.value)}
                  />
                  <button
                    className="a-btn"
                    onClick={() => {
                      setFrom("");
                      setTo("");
                    }}
                  >
                    All time
                  </button>
                </div>
                <div className="a-stats">
                  {[
                    [
                      "Bookings",
                      rangeBookings.length,
                      Ticket,
                      `${confirmed.length} active · ${rangeBookings.length - confirmed.length} cancelled`,
                    ],
                    [
                      "Booking value",
                      money(
                        confirmed.reduce(
                          (n, b) => n + Number(b.totalAmount || 0),
                          0,
                        ),
                      ),
                      IndianRupee,
                      "Active bookings · not collected revenue",
                    ],
                    [
                      "Upcoming shows",
                      upcoming.length,
                      CalendarDays,
                      "All future scheduled screenings",
                    ],
                    [
                      "Customers",
                      data.users.filter((u) => u.role !== "admin").length,
                      Users,
                      "Registered customer accounts",
                    ],
                  ].map(([label, value, Icon, note]) => (
                    <div className="a-card" key={label}>
                      <div className="a-stat-label">
                        {label}
                        <Icon />
                      </div>
                      <p className="a-stat-value">{value}</p>
                      <p className="a-muted">{note}</p>
                    </div>
                  ))}
                </div>
                <div className="a-columns">
                  <section className="a-card">
                    <h2>
                      Booking activity{" "}
                      <span className="a-muted">
                        · 7 days ending{" "}
                        {to || new Date().toISOString().slice(0, 10)}
                      </span>
                    </h2>
                    <div className="a-chart">
                      {Array.from({ length: 7 }, (_, i) => {
                        const d = new Date(
                          (to || new Date().toISOString().slice(0, 10)) +
                            "T12:00:00Z",
                        );
                        d.setUTCDate(d.getUTCDate() - 6 + i);
                        const key = d.toISOString().slice(0, 10),
                          n = rangeBookings.filter(
                            (b) =>
                              String(b.createdAt || b.bookedAt).slice(0, 10) ===
                              key,
                          ).length,
                          max = Math.max(
                            1,
                            ...Array.from({ length: 7 }, (_, j) => {
                              const z = new Date(
                                (to || new Date().toISOString().slice(0, 10)) +
                                  "T12:00:00Z",
                              );
                              z.setUTCDate(z.getUTCDate() - j);
                              return rangeBookings.filter(
                                (b) =>
                                  String(b.createdAt || b.bookedAt).slice(
                                    0,
                                    10,
                                  ) === z.toISOString().slice(0, 10),
                              ).length;
                            }),
                          );
                        return (
                          <div
                            className="a-bar-column"
                            key={key}
                            title={`${key}: ${n} bookings`}
                          >
                            <span>{n}</span>
                            <div
                              className="a-bar"
                              style={{ height: Math.max(2, (n / max) * 115) }}
                            />
                            <span>
                              {d.toLocaleDateString("en-IN", {
                                weekday: "short",
                              })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                  <section className="a-card">
                    <h2>Popular movies</h2>
                    {Object.entries(
                      confirmed.reduce((acc, b) => {
                        const t = b.show?.movie?.title || "Unknown";
                        acc[t] = (acc[t] || 0) + seats(b).length;
                        return acc;
                      }, {}),
                    )
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 4)
                      .map(([name, n], i) => (
                        <div key={name} style={{ marginBottom: 18 }}>
                          <div className="a-stat-label">
                            <span>
                              {i + 1}. {name}
                            </span>
                            <span>{n} tickets</span>
                          </div>
                          <div className="a-progress">
                            <i
                              style={{
                                width:
                                  Math.min(
                                    100,
                                    (n /
                                      Math.max(
                                        1,
                                        confirmed.reduce(
                                          (a, b) => a + seats(b).length,
                                          0,
                                        ),
                                      )) *
                                      100,
                                  ) + "%",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    {!confirmed.length && (
                      <p className="a-muted">
                        No active bookings in this period.
                      </p>
                    )}
                    <p className="a-muted">
                      Recorded paid amount (active bookings):{" "}
                      {money(
                        confirmed
                          .filter((b) => b.isPaid)
                          .reduce((n, b) => n + Number(b.totalAmount || 0), 0),
                      )}
                      . Existing payment flags are not payment-gateway
                      verification.
                    </p>
                  </section>
                </div>
                <section className="a-card">
                  <div className="admin-heading">
                    <h2>Recent bookings</h2>
                    <Link className="a-btn" to="/admin/list-bookings">
                      View all →
                    </Link>
                  </div>
                  {rangeBookings.slice(0, 5).map((b) => (
                    <div
                      className="a-tools"
                      key={b._id}
                      style={{
                        justifyContent: "space-between",
                        borderBottom: "1px solid #30303a",
                        paddingBottom: 12,
                      }}
                    >
                      <div>
                        <strong>{b.show?.movie?.title || "Movie"}</strong>
                        <p className="a-muted">
                          {b.user?.name} · {date(b.createdAt)}
                        </p>
                      </div>
                      <div className="a-actions">
                        <Badge value={status(b)} />
                        <button
                          className="a-btn"
                          onClick={() => open("booking", b)}
                        >
                          View {money(b.totalAmount)}
                        </button>
                      </div>
                    </div>
                  ))}
                  {!rangeBookings.length && (
                    <p className="a-muted">No bookings in this period.</p>
                  )}
                </section>
              </>
            ) : (
              <>
                <div className="a-tools">
                  <input
                    className="a-input a-search"
                    aria-label="Search records"
                    placeholder={
                      view === "bookings"
                        ? "Search ID, customer or movie…"
                        : "Search " + view + "…"
                    }
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
                  />
                  {view !== "customers" && (
                    <select
                      aria-label="Filter status"
                      value={filter}
                      onChange={(e) => {
                        setFilter(e.target.value);
                        setPage(1);
                      }}
                    >
                      <option value="all">All statuses</option>
                      {filters.map((f) => (
                        <option key={f} value={f}>
                          {f.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>
                  )}
                  <select
                    aria-label="Sort records"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="newest">Newest first</option>
                    <option value="name">Name A–Z</option>
                    {["bookings", "shows"].includes(view) && (
                      <option value="amount">Amount: high to low</option>
                    )}
                  </select>
                  {view === "bookings" && (
                    <>
                      <input
                        className="a-input"
                        aria-label="Booked from date"
                        type="date"
                        value={from}
                        max={to || undefined}
                        onChange={(e) => {
                          setFrom(e.target.value);
                          setPage(1);
                        }}
                      />
                      <input
                        className="a-input"
                        aria-label="Booked to date"
                        type="date"
                        value={to}
                        min={from || undefined}
                        onChange={(e) => {
                          setTo(e.target.value);
                          setPage(1);
                        }}
                      />
                      <button className="a-btn" onClick={exportCsv}>
                        <Download />
                        Export CSV
                      </button>
                    </>
                  )}
                </div>
                {!rows.length ? (
                  <Empty />
                ) : (
                  <div className="a-table-wrap">
                    <table className="a-table">
                      <thead>
                        <tr>
                          {(view === "movies"
                            ? [
                                "Movie",
                                "Language",
                                "Duration",
                                "Status",
                                "Actions",
                              ]
                            : view === "shows"
                              ? [
                                  "Movie / venue",
                                  "Show time (IST)",
                                  "Price",
                                  "Occupancy",
                                  "Status",
                                  "Actions",
                                ]
                              : view === "bookings"
                                ? [
                                    "Customer / booking",
                                    "Movie",
                                    "Seats",
                                    "Amount",
                                    "Status",
                                    "Actions",
                                  ]
                                : [
                                    "Customer",
                                    "Joined",
                                    "Bookings",
                                    "Booking value",
                                    "Actions",
                                  ]
                          ).map((h) => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {shown.map((x) => (
                          <tr key={x._id}>
                            {view === "movies" ? (
                              <>
                                <td>
                                  <div className="a-cell">
                                    {x.poster && <img src={x.poster} alt="" />}
                                    <div>
                                      <strong>{x.title}</strong>
                                      <small>
                                        {(x.genre || []).join(" · ")}
                                      </small>
                                    </div>
                                  </div>
                                </td>
                                <td>{x.language}</td>
                                <td>{x.duration || x.runtime} min</td>
                                <td>
                                  <Badge value={x.status || "now_showing"} />
                                </td>
                                <td>
                                  <button
                                    className="a-btn"
                                    onClick={() => open("movie", x)}
                                  >
                                    <Pencil />
                                    Edit
                                  </button>
                                </td>
                              </>
                            ) : view === "shows" ? (
                              <>
                                <td>
                                  <div className="a-cell">
                                    <div>
                                      <strong>{x.movie?.title}</strong>
                                      <small>
                                        {x.theatre?.name} · {x.screen?.name}
                                      </small>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  {date(x.showDate)}
                                  <p className="a-muted">{x.startTime}</p>
                                </td>
                                <td>{money(x.price)}</td>
                                <td>
                                  {new Set(x.bookedSeats || []).size} /{" "}
                                  {x.screen?.totalSeats || 90}
                                  <div className="a-progress">
                                    <i
                                      style={{
                                        width:
                                          Math.min(
                                            100,
                                            (new Set(x.bookedSeats || []).size /
                                              (x.screen?.totalSeats || 90)) *
                                              100,
                                          ) + "%",
                                      }}
                                    />
                                  </div>
                                </td>
                                <td>
                                  <Badge
                                    value={
                                      x.status === "cancelled"
                                        ? "cancelled"
                                        : showStart(x) > now
                                          ? "upcoming"
                                          : "past"
                                    }
                                  />
                                </td>
                                <td>
                                  <div className="a-actions">
                                    <button
                                      className="a-btn"
                                      onClick={() => open("seats", x)}
                                    >
                                      Seats
                                    </button>
                                    <button
                                      className="a-btn"
                                      disabled={
                                        x.status === "cancelled" ||
                                        showStart(x) <= now
                                      }
                                      onClick={() => open("show", x)}
                                      aria-label={"Edit " + x.movie?.title}
                                    >
                                      <Pencil />
                                    </button>
                                    <button
                                      className="a-btn danger"
                                      disabled={
                                        x.status === "cancelled" ||
                                        showStart(x) <= now
                                      }
                                      onClick={() => open("cancel-show", x)}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </td>
                              </>
                            ) : view === "bookings" ? (
                              <>
                                <td>
                                  <div className="a-cell">
                                    <div>
                                      <strong>
                                        {x.user?.name || "Customer"}
                                      </strong>
                                      <small>{x.bookingId || x._id}</small>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  {x.show?.movie?.title}
                                  <p className="a-muted">
                                    {date(x.show?.showDate)}
                                  </p>
                                </td>
                                <td>{seats(x).join(", ")}</td>
                                <td>
                                  {money(x.totalAmount)}
                                  <p className="a-muted">
                                    {x.isPaid ? "Recorded paid" : "Unpaid"}
                                  </p>
                                </td>
                                <td>
                                  <Badge value={status(x)} />
                                </td>
                                <td>
                                  <button
                                    className="a-btn"
                                    onClick={() => open("booking", x)}
                                  >
                                    <Eye />
                                    Details
                                  </button>
                                </td>
                              </>
                            ) : (
                              <>
                                <td>
                                  <strong>{x.name}</strong>
                                  <p className="a-muted">
                                    {x.email} · {x.role}
                                  </p>
                                </td>
                                <td>{date(x.createdAt)}</td>
                                <td>
                                  {
                                    allBookings.filter(
                                      (b) => id(b.user || b.userId) === id(x),
                                    ).length
                                  }
                                </td>
                                <td>
                                  {money(
                                    allBookings
                                      .filter(
                                        (b) =>
                                          id(b.user || b.userId) === id(x) &&
                                          status(b) !== "cancelled",
                                      )
                                      .reduce(
                                        (n, b) =>
                                          n + Number(b.totalAmount || 0),
                                        0,
                                      ),
                                  )}
                                </td>
                                <td>
                                  <button
                                    className="a-btn"
                                    onClick={() => open("customer", x)}
                                  >
                                    History
                                  </button>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="a-pages">
                  <span>
                    {rows.length} records · Page {currentPage} of {totalPages}
                  </span>
                  <div className="a-actions">
                    <button
                      className="a-btn"
                      disabled={currentPage === 1}
                      onClick={() => setPage(currentPage - 1)}
                    >
                      Previous
                    </button>
                    <button
                      className="a-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => setPage(currentPage + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )
      )}
      {modal && data && (
        <Modal
          title={
            {
              movie: modal.item ? "Edit movie" : "Add movie",
              show: modal.item ? "Edit show" : "Schedule a show",
              booking: "Booking details",
              seats: "Seat occupancy",
              customer: "Customer history",
              "cancel-show": "Cancel this show?",
              "cancel-booking": "Cancel this booking?",
            }[modal.kind]
          }
          onClose={() => {
            if (!busy) setModal(null);
          }}
        >
          {formError && (
            <p className="a-error" role="alert">
              {formError}
            </p>
          )}
          {modal.kind === "movie" && (
            <MovieForm
              item={modal.item}
              busy={busy}
              onSave={async (values) => {
                if (modal.item)
                  return act("/movies/" + modal.item._id, "PUT", values);
                setBusy(true);
                try {
                  const res = await createMovie(values);
                  if (!res?.success)
                    throw new Error(res?.message || "Unable to save movie");
                  setModal(null);
                  toast.success("Movie added");
                  await load();
                } catch (e) {
                  setFormError(e.message);
                } finally {
                  setBusy(false);
                }
              }}
            />
          )}
          {modal.kind === "show" && (
            <ShowForm
              item={modal.item}
              data={data}
              busy={busy}
              onSave={async (values) => {
                if (modal.item)
                  return act("/shows/" + modal.item._id, "PUT", values);
                setBusy(true);
                try {
                  const res = await createShow(values);
                  if (!res?.success)
                    throw new Error(res?.message || "Unable to save show");
                  setModal(null);
                  toast.success("Show scheduled");
                  await load();
                } catch (e) {
                  setFormError(e.message);
                } finally {
                  setBusy(false);
                }
              }}
            />
          )}
          {modal.kind === "booking" && (
            <>
              <dl className="a-details">
                {Object.entries({
                  "Booking ID": modal.item.bookingId || modal.item._id,
                  Customer: modal.item.user?.name,
                  Email: modal.item.user?.email,
                  Movie: modal.item.show?.movie?.title,
                  Theatre:
                    modal.item.show?.theatre?.name ||
                    "Legacy booking — venue unavailable",
                  Screen: modal.item.show?.screen?.name || "—",
                  Show:
                    date(modal.item.show?.showDate) +
                    " · " +
                    (modal.item.show?.startTime || "—"),
                  Seats: seats(modal.item).join(", "),
                  Amount: money(modal.item.totalAmount),
                  Status: status(modal.item),
                  Payment: modal.item.isPaid
                    ? "Recorded paid"
                    : "Unpaid — no payment collected",
                  Refund:
                    modal.item.refundStatus?.replaceAll("_", " ") ||
                    "Not requested",
                }).map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <button
                className="a-btn danger"
                disabled={status(modal.item) === "cancelled"}
                onClick={() => open("cancel-booking", modal.item)}
              >
                Cancel booking
              </button>
            </>
          )}
          {modal.kind.startsWith("cancel-") && (
            <>
              <p className="a-muted">
                {modal.kind === "cancel-show"
                  ? "All bookings for this show will be cancelled."
                  : "This booking will be cancelled and its seats released."}{" "}
                Booking history will be preserved. Recorded paid bookings will
                be marked for refund review; no money is refunded automatically.
                Only future shows can be cancelled.
              </p>
              <div className="a-form-footer">
                <button
                  className="a-btn"
                  disabled={busy}
                  onClick={() => setModal(null)}
                >
                  Keep it
                </button>
                <button
                  className="a-btn danger"
                  disabled={busy}
                  onClick={() =>
                    act(
                      "/" +
                        (modal.kind === "cancel-show" ? "shows" : "bookings") +
                        "/" +
                        modal.item._id +
                        "/cancel",
                      "POST",
                      {},
                    )
                  }
                >
                  {busy ? "Cancelling…" : "Confirm cancellation"}
                </button>
              </div>
            </>
          )}
          {modal.kind === "seats" && (
            <>
              <p className="a-muted">
                {modal.item.movie?.title} · {modal.item.screen?.name} ·{" "}
                {date(modal.item.showDate)} {modal.item.startTime}
              </p>
              <p className="a-muted">
                Pink = booked · Outline = available ·{" "}
                {new Set(modal.item.bookedSeats || []).size} booked
              </p>
              <div className="a-screen">SCREEN THIS WAY</div>
              <div className="a-seats">
                {Array.from(
                  { length: modal.item.screen?.totalSeats || 90 },
                  (_, i) =>
                    String.fromCharCode(65 + Math.floor(i / 9)) + ((i % 9) + 1),
                ).map((s) => (
                  <span
                    className={
                      "a-seat " +
                      ((modal.item.bookedSeats || []).includes(s)
                        ? "booked"
                        : "")
                    }
                    key={s}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </>
          )}
          {modal.kind === "customer" && (
            <>
              <p>
                {modal.item.name} · {modal.item.email}
              </p>
              {allBookings
                .filter((b) => id(b.user || b.userId) === id(modal.item))
                .map((b) => (
                  <div className="a-card" style={{ marginTop: 12 }} key={b._id}>
                    <strong>{b.show?.movie?.title}</strong>
                    <p className="a-muted">
                      {date(b.createdAt)} · {seats(b).join(", ")} ·{" "}
                      {money(b.totalAmount)}
                    </p>
                    <Badge value={status(b)} />
                  </div>
                ))}
              {!allBookings.some(
                (b) => id(b.user || b.userId) === id(modal.item),
              ) && <p className="a-muted">No booking history.</p>}
            </>
          )}
        </Modal>
      )}
    </>
  );
}
function MovieForm({ item, busy, onSave }) {
  const [f, setF] = useState({
    ...initialMovie,
    ...item,
    genre: Array.isArray(item?.genre)
      ? item.genre.join(", ")
      : initialMovie.genre,
  });
  const input = (key, type = "text", extra = {}) => (
    <input
      className="a-input"
      type={type}
      value={f[key] ?? ""}
      onChange={(e) => setF({ ...f, [key]: e.target.value })}
      {...extra}
    />
  );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(f);
      }}
    >
      <Field label="Movie title" wide>
        {input("title", "text", { required: true, maxLength: 200 })}
      </Field>
      <Field label="Synopsis" wide>
        <textarea
          value={f.description}
          onChange={(e) => setF({ ...f, description: e.target.value })}
        />
      </Field>
      <Field label="Language">
        {input("language", "text", { required: true })}
      </Field>
      <Field label="Genres (comma separated)">{input("genre")}</Field>
      <Field label="Duration (minutes)">
        {input("duration", "number", { min: 1, max: 600, required: true })}
      </Field>
      <Field label="Rating / 10">
        {input("rating", "number", { min: 0, max: 10, step: 0.1 })}
      </Field>
      <Field label="Release date">{input("releaseDate", "date")}</Field>
      <Field label="Status">
        <select
          value={f.status}
          onChange={(e) => setF({ ...f, status: e.target.value })}
        >
          <option value="now_showing">Now showing</option>
          <option value="coming_soon">Coming soon</option>
          <option value="archived">Archived</option>
        </select>
      </Field>
      <Field label="Poster URL" wide>
        {input("poster", "url")}
      </Field>
      <Field label="Trailer URL" wide>
        {input("trailer", "url")}
      </Field>
      <p className="a-muted a-field wide">
        Archive preserves history. Cancel upcoming shows before archiving.
      </p>
      <div className="a-form-footer">
        <button className="a-btn primary" disabled={busy}>
          {busy ? "Saving…" : "Save movie"}
        </button>
      </div>
    </form>
  );
}
function ShowForm({ item, data, busy, onSave }) {
  const [f, setF] = useState({
    movie: id(item?.movie),
    theatre: id(item?.theatre),
    screen: id(item?.screen),
    showDate: String(item?.showDate || "").slice(0, 10),
    startTime: item
      ? new Date(showStart(item)).toLocaleTimeString("en-GB", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
    price: item?.price || 200,
    turnaroundMinutes: item?.turnaroundMinutes ?? 15,
  });
  const set = (k, v) => setF({ ...f, [k]: v });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(f);
      }}
    >
      <Field label="Movie" wide>
        <select
          required
          value={f.movie}
          onChange={(e) => set("movie", e.target.value)}
        >
          <option value="">Select movie</option>
          {data.movies
            .filter((m) => m.status !== "archived")
            .map((m) => (
              <option key={m._id} value={m._id}>
                {m.title} · {m.duration || m.runtime} min
              </option>
            ))}
        </select>
      </Field>
      <Field label="Theatre">
        <select
          required
          value={f.theatre}
          onChange={(e) => setF({ ...f, theatre: e.target.value, screen: "" })}
        >
          <option value="">Select theatre</option>
          {data.theatres.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Screen">
        <select
          required
          value={f.screen}
          onChange={(e) => set("screen", e.target.value)}
        >
          <option value="">Select screen</option>
          {data.screens
            .filter((s) => id(s.theatre) === f.theatre)
            .map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} · {s.totalSeats} seats
              </option>
            ))}
        </select>
      </Field>
      <Field label="Show date (India)">
        <input
          required
          type="date"
          value={f.showDate}
          onChange={(e) => set("showDate", e.target.value)}
        />
      </Field>
      <Field label="Start time (IST)">
        <input
          required
          type="time"
          value={f.startTime}
          onChange={(e) => set("startTime", e.target.value)}
        />
      </Field>
      <Field label="Ticket price (₹)">
        <input
          required
          type="number"
          min="1"
          max="100000"
          value={f.price}
          onChange={(e) => set("price", e.target.value)}
        />
      </Field>
      <Field label="Turnaround buffer (minutes)">
        <input
          required
          type="number"
          min="0"
          max="120"
          value={f.turnaroundMinutes}
          onChange={(e) => set("turnaroundMinutes", e.target.value)}
        />
      </Field>
      <p className="a-muted a-field wide">
        End time is calculated from the movie duration. Overlapping shows are
        blocked. Shows with reserved seats cannot be edited.
      </p>
      <div className="a-form-footer">
        <button className="a-btn primary" disabled={busy}>
          {busy ? "Saving…" : "Save show"}
        </button>
      </div>
    </form>
  );
}
