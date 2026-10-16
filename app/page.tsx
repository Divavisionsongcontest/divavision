
"use client";

import { useState } from "react";

const countries = [
  { id: 1, name: "France", song: "Dernière danse", artist: "Indila" },
  { id: 2, name: "Norway", song: "Not Afraid", artist: "JJ" },
  { id: 3, name: "Germany", song: "Vertigo", artist: "Judit G." },
  { id: 4, name: "Japan", song: "Callate", artist: "Rosalinda Galan" },
  { id: 5, name: "Greece", song: "Ya Halmi", artist: "Alexandra Stan" },
  { id: 6, name: "Switzerland", song: "training season", artist: "Dua Lipa" },
  { id: 7, name: "Austria", song: "Super Elastic", artist: "Valencia Grace" },
  { id: 8, name: "Malta", song: "Watermelon Sugar", artist: "Harry Styles" },
  { id: 9, name: "Bosnia & Herzegovina", song: "Stop The Wedding", artist: "Ashee" },
  { id: 10, name: "Estonia", song: "Pay Starse", artist: "Galena & Azis" },
  { id: 11, name: "Turkiye", song: "Den Kano Ego Gia Spiti", artist: "Eleni Foureira" },
  { id: 12, name: "Kazakhstan", song: "Not Me", artist: "ILLIT" },
  { id: 13, name: "Denmark", song: "Dead Dance", artist: "Lady Gaga" },
  { id: 14, name: "Poland", song: "Yes Baby", artist: "Madison Beer" },
  { id: 15, name: "San Marino", song: "Caos", artist: "Sarah Toscano" },
  { id: 16, name: "Azerbaijan", song: "Bumeranq", artist: "Murad Arif & Röya" },
];

const flagCodes: Record<string, string> = {
  France: "fr",
  Norway: "no",
  Germany: "de",
  Japan: "jp",
  Greece: "gr",
  Switzerland: "ch",
  Austria: "at",
  Malta: "mt",
  "Bosnia & Herzegovina": "ba",
  Estonia: "ee",
  Turkiye: "tr",
  Kazakhstan: "kz",
  Denmark: "dk",
  Poland: "pl",
  "San Marino": "sm",
  Azerbaijan: "az",
};

function CountryFlag({ name }: { name: string }) {
  return (
    <img
      src={`https://flagcdn.com/w80/${flagCodes[name]}.png`}
      alt={`${name} flag`}
      className="h-7 w-10 shrink-0 rounded object-cover sm:h-8 sm:w-12"
    />
  );
}

export default function Home() {
  const [juryCountry, setJuryCountry] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<number, number>>({});
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isRestOfWorld = juryCountry === "Rest Of The World";

  const votingCountries = countries.filter(
    (country) => isRestOfWorld || country.name !== juryCountry
  );

  const totalVotes = Object.values(votes).reduce(
    (sum, value) => sum + value,
    0
  );

  const selectedCountries = Object.values(votes).filter(
    (value) => value > 0
  ).length;

  function selectJury(country: string) {
    setJuryCountry(country);
    setVotes({});
    setMessage("");
    setSubmitted(false);
  }

  function changeVote(id: number, amount: number) {
    setMessage("");
    setSubmitted(false);

    setVotes((previous) => {
      const current = previous[id] || 0;
      const next = current + amount;
      const currentTotal = Object.values(previous).reduce(
        (sum, value) => sum + value,
        0
      );

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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jury_country: juryCountry,
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
            alt="Contest Logo"
            className="h-20 w-auto max-w-[65%] object-contain sm:h-28"
          />
          <div className="rounded-full border border-violet-400/30 px-3 py-2 text-xs text-violet-200">
            FIRST SEMI FINAL
          </div>
        </div>
      </header>

      {!juryCountry ? (
        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-300">
              Welcome to Divavision
            </p>
            <h1 className="mt-3 text-3xl font-black sm:text-5xl">
              Select your <span className="text-violet-400">jury country</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-gray-400 sm:text-base">
              Choose your jury country to continue to the voting page.
              Jury members cannot vote for their own country.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {countries.map((country) => (
              <button
                key={country.id}
                type="button"
                onClick={() => selectJury(country.name)}
                className="flex min-h-16 items-center gap-3 rounded-2xl border border-white/10 bg-[#151027] p-4 text-left transition hover:border-violet-400 hover:bg-violet-500/10"
              >
                <CountryFlag name={country.name} />
                <span className="text-sm font-bold sm:text-base">
                  {country.name}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => selectJury("Rest Of The World")}
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
                {isRestOfWorld ? "🌍 " : ""}
                {juryCountry}
              </h1>
              <button
                type="button"
                onClick={() => {
                  setJuryCountry(null);
                  setVotes({});
                  setMessage("");
                  setSubmitted(false);
                }}
                className="rounded-xl border border-white/10 px-3 py-2 text-xs text-gray-300 transition hover:bg-white/10"
              >
                Change voter
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-400">
              {isRestOfWorld
                ? "You can vote for all 16 countries."
                : `You cannot give points to ${juryCountry}.`}
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
              Discover the performances, distribute your 15 points, and help
              your favorites qualify for the Grand Final!
            </p>
            <p className="mt-2 text-xs italic text-slate-400">
              Voting closes: 11.19.2026 17:00 CET
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
                <span className="text-base text-gray-500">
                  {" "}/ {votingCountries.length}
                </span>
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
                <CountryFlag name={country.name} />
                <div className="min-w-0 flex-1">
                  <h4 className="truncate font-bold">{country.name}</h4>
                  <p className="mt-1 truncate text-sm text-violet-300">
                    {country.song}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-gray-500">
                    {country.artist}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Remove a point from ${country.name}`}
                    onClick={() => changeVote(country.id, -1)}
                    disabled={!votes[country.id]}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-xl transition hover:bg-white/10 disabled:opacity-30 sm:h-11 sm:w-11"
                  >
                    −
                  </button>
                  <span className="w-5 text-center font-bold tabular-nums">
                    {votes[country.id] || 0}
                  </span>
                  <button
                    type="button"
                    aria-label={`Give a point to ${country.name}`}
                    onClick={() => changeVote(country.id, 1)}
                    disabled={totalVotes >= 15}
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
              <li>• You must vote for at least 3 different countries.</li>
              <li>• Distribute your points however you like.</li>
              {!isRestOfWorld && (
                <li>• You cannot vote for your own jury country.</li>
              )}
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
              Divavision · First Semi final
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
