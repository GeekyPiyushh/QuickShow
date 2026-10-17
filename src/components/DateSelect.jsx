import { showStart } from "../lib/showStart";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getShows } from "../lib/api";
export default function DateSelect({ id }) {
  const [dates, setDates] = useState([]),
    [selected, setSelected] = useState(""),
    [message, setMessage] = useState("Loading screenings…");
  const navigate = useNavigate();
  useEffect(() => {
    let live = true;
    getShows().then((r) => {
      if (!live) return;
      if (!r?.success) {
        setMessage("Unable to load screenings. Please refresh.");
        return;
      }
      const ds = [
        ...new Set(
          r.shows
            .filter(
              (s) =>
                String(s.movie?._id || s.movie?.id) === String(id) &&
                s.status !== "cancelled" &&
                showStart(s) > Date.now(),
            )
            .map((s) => String(s.showDate).slice(0, 10)),
        ),
      ].sort();
      setDates(ds);
      setSelected("");
      setMessage(ds.length ? "" : "No upcoming screenings scheduled.");
    });
    return () => {
      live = false;
    };
  }, [id]);
  return (
    <section id="dateselect" className="pt-16">
      <div className="p-8 bg-primary/10 border border-primary/20 rounded-xl">
        <h2 className="text-lg font-semibold mb-4">Choose a screening date</h2>
        {message && <p className="text-gray-400">{message}</p>}
        <div className="flex flex-wrap gap-3">
          {dates.map((d) => (
            <button
              className={
                "p-3 rounded-lg border " +
                (selected === d
                  ? "bg-primary border-primary"
                  : "border-white/20")
              }
              key={d}
              onClick={() => setSelected(d)}
            >
              {new Date(d + "T12:00:00").toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })}
            </button>
          ))}
        </div>
        {dates.length > 0 && (
          <button
            disabled={!selected}
            className="bg-primary rounded-lg px-6 py-3 mt-5 disabled:opacity-40"
            onClick={() => {
              navigate(`/movies/${id}/${selected}`);
              window.scrollTo(0, 0);
            }}
          >
            Choose seats
          </button>
        )}
      </div>
    </section>
  );
}
