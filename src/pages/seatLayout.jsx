import { showStart } from "../lib/showStart";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMovieById, getShows, getShowSeats } from "../lib/api";
import toast from "react-hot-toast";
export default function SeatLayout() {
  const { id, date } = useParams();
  return <Seats key={id + date} id={id} date={date} />;
}
function Seats({ id, date }) {
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null),
    [shows, setShows] = useState([]),
    [selected, setSelected] = useState(null),
    [layout, setLayout] = useState(null),
    [chosen, setChosen] = useState([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [seatLoading, setSeatLoading] = useState(false);
  useEffect(() => {
    let live = true;
    Promise.all([getMovieById(id), getShows()])
      .then(([m, r]) => {
        if (!live) return;
        if (!m || !r?.success) {
          setError("Unable to load screenings. Please refresh and try again.");
          return;
        }
        setMovie(m);
        setShows(
          r.shows.filter(
            (s) =>
              String(s.movie?._id || s.movie?.id) === String(id) &&
              String(s.showDate).slice(0, 10) === date &&
              s.status !== "cancelled" &&
              showStart(s) > Date.now(),
          ),
        );
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [id, date]);
  useEffect(() => {
    if (!selected) return;
    let live = true;
    getShowSeats(selected._id)
      .then((r) => {
        if (live) {
          if (!r) setError("Unable to load seats. Select the show again.");
          else {
            setError("");
            setLayout(r);
          }
        }
      })
      .finally(() => {
        if (live) setSeatLoading(false);
      });
    return () => {
      live = false;
    };
  }, [selected]);
  function proceed() {
    if (!selected || !chosen.length)
      return toast.error("Choose a show and at least one seat.");
    navigate("/booking-summary", {
      state: {
        movie: {
          ...movie,
          poster_path: movie.poster_path || movie.poster,
          runtime: movie.runtime || movie.duration,
          genres: movie.genres || [],
        },
        selectedSeats: chosen,
        selectedTime: selected.startTime,
        showDate: date,
        showPrice: selected.price,
        showId: selected._id,
        theatre: selected.theatre?.name,
        screen: selected.screen?.name,
      },
    });
  }
  return (
    <main className="px-6 md:px-24 pt-32 pb-20 min-h-screen">
      <h1 className="text-2xl font-semibold">
        {movie?.title || "Select your seats"}
      </h1>
      <p className="text-gray-400 mt-2">{date} · Show times in IST</p>
      {error && (
        <p className="text-red-300 mt-5" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <p className="mt-8">Loading shows…</p>
      ) : !shows.length ? (
        <p className="mt-8">
          No available screenings on this date. Choose another date from the
          movie page.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-3 mt-7">
            {shows.map((s) => (
              <button
                className={
                  "p-4 rounded-lg border text-left " +
                  (selected?._id === s._id
                    ? "bg-primary border-primary"
                    : "border-white/20")
                }
                key={s._id}
                onClick={() => {
                  setSeatLoading(true);
                  setLayout(null);
                  setChosen([]);
                  setSelected({ ...s });
                }}
              >
                <strong>
                  {s.startTime} · ₹{s.price}
                </strong>
                <p className="text-xs mt-1">
                  {s.theatre?.name} · {s.screen?.name}
                </p>
              </button>
            ))}
          </div>
          {seatLoading && <p className="mt-8">Loading seats…</p>}
          {layout && (
            <div className="max-w-lg mx-auto mt-12">
              <p className="text-center text-gray-400 border-t-4 border-white/30 rounded-t-[50%] pt-5 mb-8 text-xs tracking-widest">
                SCREEN THIS WAY
              </p>
              <div className="grid grid-cols-9 gap-2">
                {layout.seats.map((s) => {
                  const booked = layout.bookedSeats.includes(s),
                    active = chosen.includes(s);
                  return (
                    <button
                      key={s}
                      disabled={booked}
                      aria-label={
                        s +
                        (booked
                          ? " booked"
                          : active
                            ? " selected"
                            : " available")
                      }
                      aria-pressed={active}
                      onClick={() => {
                        if (active) setChosen(chosen.filter((x) => x !== s));
                        else if (chosen.length < 5) setChosen([...chosen, s]);
                        else toast.error("Maximum 5 seats per booking.");
                      }}
                      className={
                        "h-9 text-xs rounded border " +
                        (booked
                          ? "bg-gray-700 border-gray-700 text-gray-500"
                          : active
                            ? "bg-primary border-primary"
                            : "border-primary/50")
                      }
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-5">
                Grey: booked · Pink: selected · Outline: available
              </p>
              <button
                className="w-full bg-primary rounded-full py-3 mt-8 disabled:opacity-40"
                disabled={!chosen.length}
                onClick={proceed}
              >
                Continue · {chosen.length} seats · ₹
                {chosen.length * selected.price}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
