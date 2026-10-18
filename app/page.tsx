"use client";

import { useState } from "react";

type Contestant = {
  id: number;
  name: string;
  song: string;
  artist: string;
};

const countries: Contestant[] = Array.from({ length: 25 }, (_, index) => ({
  id: index + 1,
  name: "Country",
  song: "Song",
  artist: "Singer",
}));

export default function Home() {
  const [juryCountryId, setJuryCountryId] = useState<number | null>(null);
  const [isRestOfWorld, setIsRestOfWorld] = useState(false);
  const [votes, setVotes] = useState<Record<number, number>>({});
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const votingCountries = countries.filter(
    (country) => isRestOfWorld || country.id !== juryCountryId
  );

  const totalVotes = Object.values(votes).reduce((sum, value) => sum + value, 0);
  const selectedCountries = Object.values(votes).filter((value) => value > 0).length;

  function selectJuryCountry(id: number) {
    setJuryCountryId(id);
    setIsRestOfWorld(false);
    setVotes({});
    setMessage("");
    setSubmitted(false);
  }

  function selectRestOfWorld() {
    setJuryCountryId(null);
    setIsRestOfWorld(true);
    setVotes({});
    setMessage("");
    setSubmitted(false);
  }

  function changeVoter() {
    setJuryCountryId(null);
    setIsRestOfWorld(false);
    setVotes({});
    setMessage("");
    setSubmitted(false);
  }

  function changeVote(id: number, amount: number) {
    if (submitted) return;
    setMessage("");

    setVotes((previous) => {
      const current = previous[id] || 0;
      const next = current + amount;
      const currentTotal = Object.values(previous).reduce((sum, value) => sum + value, 0);

      if (
        next < 0 ||
        (amount > 0 && currentTotal >= 15) ||
        !votingCountries.some((country) => country.id === id)
      ) {
        return previous;
      }

      return { ...previous, [id]: next };
    });
  }

  async function submitVote() {
    if (!isRestOfWorld && juryCountryId === null) {
      setMessage("Please select your voter country first.");
      return;
    }

    if (totalVotes !== 15) {
      setMessage("You must use exactly 15 points before continuing.");
      return;
    }

    if (selectedCountries < 3) {
      setMessage("You must vote for at least 3 different countries.");
      return;
    }

    setMessage("Submitting your votes...");

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jury_country: isRestOfWorld ? "Rest Of The World" : `Country #${juryCountryId}`,
          points: votes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Your votes could not be saved.");
        return;
      }

      setSubmitted(true);
      setMessage("Your votes have been submitted successfully!");
    } catch {
      setMessage("Connection error. Please try again.");
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0818] text-white">
      <header className="border-b border-white/10 bg-[#100b23]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-5">
          <img
            src="/DivavisionLogo.png"
            alt="Divavision logo"
            className="h-20 w-auto max-w-[65%] object-contain sm:h-28"
          />
          <div className="rounded-full border border-violet-400/30 px-3 py-2 text-xs text-violet-200">
            GRAND FINAL
          </div>
        </div>
      </header>

      {juryCountryId === null && !isRestOfWorld ? (
        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-300">
              Welcome to Divavision
            </p>
            <h1 className="mt-3 text-3xl font-black sm:text-5xl">
              Select your <span className="text-violet-400">jury country</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-gray-400 sm:text-base">
              Choose your country to continue to the Grand Final voting page.
              Jury members cannot vote for their own entry.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {countries.map((country) => (
              <button
                key={country.id}
                type="button"
                onClick={() => selectJuryCountry(country.id)}
                className="flex min-h-16 items-center gap-3 rounded-2xl border border-white/10 bg-[#151027] p-4 text-left transition hover:border-violet-400 hover:bg-violet-500/10"
              >
                <span className="flex h-8 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-xs font-black text-violet-200">
                  {String(country.id).padStart(2, "0")}
                </span>
                <span className="text-sm font-bold sm:text-base">{country.name}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={selectRestOfWorld}
            className="mt-5 flex min-h-20 w-full items-center gap-4 rounded-2xl border border-violet-400/40 bg-violet-500/10 p-5 text-left transition hover:border-violet-300 hover:bg-violet-500/20"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 text-2xl">
              🌍
            </span>
            <span>
              <span className="block font-black">Rest Of The World</span>
              <span className="mt-1 block text-xs text-gray-400">
                For voters who are not part of a jury country
              </span>
            </span>
            <span className="ml-auto text-xl text-violet-300">→</span>
          </button>
        </section>
      ) : (
        <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="mb-8 rounded-2xl border border-violet-400/20 bg-violet-500/[0.07] p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">
              You are voting as
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-xl font-black sm:text-2xl">
                {isRestOfWorld ? "🌍 Rest Of The World" : `Country #${juryCountryId}`}
              </h1>
              <button
                type="button"
                onClick={changeVoter}
                className="rounded-xl border border-white/10 px-3 py-2 text-xs text-gray-300 transition hover:bg-white/10"
              >
                Change voter
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-400">
              {isRestOfWorld
                ? `You can vote for all ${countries.length} countries.`
                : "You cannot give points to your own entry."}
            </p>
          </div>

          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-300">
              Your voice matters
            </p>
            <h2 className="mt-2 text-3xl font-black sm:text-5xl">
              Make your vote.
              <br />
              <span className="text-violet-400">Support your favorite.</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-gray-400 sm:text-base">
              Discover all 25 performances, distribute your 15 points, and help
              decide the Grand Final winner!
            </p>
            <p className="mt-2 text-xs italic text-slate-400">
              Voting closes: 11.21.2026 17:00 CET
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs text-gray-400">Points remaining</p>
              <p className="mt-1 text-3xl font-black text-violet-300">
                {15 - totalVotes}
                <span className="text-base text-gray-500"> / 15</span>
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs text-gray-400">Countries selected</p>
              <p className="mt-1 text-3xl font-black">
                {selectedCountries}
                <span className="text-base text-gray-500"> / {votingCountries.length}</span>
              </p>
            </div>
            <div className="col-span-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:col-span-1">
              <div className="mb-3 flex justify-between text-xs text-gray-400">
                <span>Voting progress</span>
                <span>{Math.round((totalVotes / 15) * 100)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-violet-500 transition-all"
                  style={{ width: `${(totalVotes / 15) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">Contestants</h3>
            <p className="text-xs text-gray-400">
              {votingCountries.length} countries · Televote
            </p>
          </div>

          <div className="space-y-3">
            {votingCountries.map((country, index) => (
              <article
                key={country.id}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#151027] p-3 transition hover:border-violet-400/50 sm:gap-5 sm:p-5"
              >
                <span className="w-5 text-xs text-gray-500">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex h-8 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-xs font-black text-violet-200 sm:h-9 sm:w-12">
                  {String(country.id).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate font-bold">{country.name}</h4>
                  <p className="mt-1 truncate text-sm text-violet-300">{country.song}</p>
                  <p className="mt-0.5 truncate text-xs text-gray-500">{country.artist}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Remove a point from entry ${country.id}`}
                    onClick={() => changeVote(country.id, -1)}
                    disabled={!votes[country.id] || submitted}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-xl transition hover:bg-white/10 disabled:opacity-30 sm:h-11 sm:w-11"
                  >
                    −
                  </button>
                  <span className="w-5 text-center font-bold tabular-nums">
                    {votes[country.id] || 0}
                  </span>
                  <button
                    type="button"
                    aria-label={`Give a point to entry ${country.id}`}
                    onClick={() => changeVote(country.id, 1)}
                    disabled={totalVotes >= 15 || submitted}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-xl transition hover:bg-violet-500 disabled:opacity-30 sm:h-11 sm:w-11"
                  >
                    +
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-violet-400/20 bg-violet-500/[0.07] p-4 sm:p-5">
            <p className="text-sm font-semibold">Voting rules</p>
            <ul className="mt-2 space-y-1 text-sm text-gray-400">
              <li>• You must use exactly 15 points.</li>
              <li>• You must vote for at least 3 different entries.</li>
              <li>• Distribute your points however you like.</li>
              {!isRestOfWorld && <li>• You cannot vote for your own entry.</li>}
            </ul>

            {message && (
              <p
                role="status"
                className="mt-4 rounded-xl border border-violet-400/20 bg-violet-400/10 p-3 text-sm text-violet-200"
              >
                {message}
              </p>
            )}

            <button
              type="button"
              onClick={submitVote}
              disabled={submitted}
              className="mt-5 w-full rounded-xl bg-violet-600 px-5 py-4 font-bold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitted ? "VOTE SUBMITTED ✓" : "SUBMIT MY VOTES →"}
            </button>

            <p className="mt-3 text-center text-xs text-gray-500">
              Divavision · Grand Final
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
