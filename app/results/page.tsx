
"use client";

import { useEffect, useState } from "react";

type Vote = {
  id: string;
  jury_country: string;
  points: Record<string, number>;
};

const countries = [
  { id: 1, name: "France" },
  { id: 2, name: "Norway" },
  { id: 3, name: "Germany" },
  { id: 4, name: "Japan" },
  { id: 5, name: "Greece" },
  { id: 6, name: "Switzerland" },
  { id: 7, name: "Austria" },
  { id: 8, name: "Malta" },
  { id: 9, name: "Bosnia & Herzegovina" },
  { id: 10, name: "Estonia" },
  { id: 11, name: "Turkiye" },
  { id: 12, name: "Kazakhstan" },
  { id: 13, name: "Denmark" },
  { id: 14, name: "Poland" },
  { id: 15, name: "San marino" },
  { id: 16, name: "Azerbaijan" },
];

export default function ResultsPage() {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);

  async function loadVotes() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/votes", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Oylar yüklenemedi.");
      }

      setVotes(data.votes);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Bir hata oluştu."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVotes();
  }, []);

  const results = countries
    .map((country) => {
      const receivedFrom = votes
        .map((vote) => ({
          jury: vote.jury_country,
          points: Number(vote.points?.[String(country.id)] ?? 0),
        }))
        .filter((vote) => vote.points > 0);

      return {
        ...country,
        total: receivedFrom.reduce(
          (sum, vote) => sum + vote.points,
          0
        ),
        receivedFrom,
      };
    })
    .sort((a, b) => b.total - a.total || a.id - b.id);

  const selected = results.find(
    (country) => country.id === selectedCountry
  );

  return (
    <main className="min-h-screen bg-[#0e0063] px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm uppercase tracking-[0.3em] text-purple-200">
          Divavision
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          First Semi-Final Results
        </h1>

        <p className="mt-2 text-purple-200">
          Jürilerin verdiği puanların toplamı
        </p>

        <button
          onClick={loadVotes}
          className="mt-6 rounded-lg border border-white/30 px-4 py-2 hover:bg-white/10"
        >
          Sonuçları yenile
        </button>

        {loading && <p className="mt-6">Oylar yükleniyor...</p>}

        {error && (
          <p className="mt-6 rounded-lg bg-red-900/50 p-4">
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
            <p className="mt-5 text-sm text-purple-200">
              Kaydedilen oy sayısı: {votes.length}
            </p>

            <div className="mt-6 overflow-hidden rounded-xl border border-white/20">
              <div className="grid grid-cols-[55px_1fr_100px] bg-white/10 p-3 text-sm font-semibold">
                <span>Sıra</span>
                <span>Ülke</span>
                <span className="text-right">Puan</span>
              </div>

              {results.map((country, index) => (
                <button
                  key={country.id}
                  onClick={() =>
                    setSelectedCountry(
                      selectedCountry === country.id
                        ? null
                        : country.id
                    )
                  }
                  className="grid w-full grid-cols-[55px_1fr_100px] items-center border-t border-white/10 p-4 text-left hover:bg-white/10"
                >
                  <span>{index + 1}</span>
                  <span>{country.name}</span>
                  <span className="text-right text-xl font-bold">
                    {country.total}
                  </span>
                </button>
              ))}
            </div>

            {selected && (
              <section className="mt-6 rounded-xl border border-white/20 p-5">
                <h2 className="text-xl font-bold">
                  {selected.name} — Jüri puanları
                </h2>

                {selected.receivedFrom.length === 0 ? (
                  <p className="mt-3 text-purple-200">
                    Bu ülkeye henüz puan verilmedi.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {selected.receivedFrom.map((entry, index) => (
                      <div
                        key={`${entry.jury}-${index}`}
                        className="flex justify-between gap-4 border-b border-white/10 pb-2"
                      >
                        <span>{entry.jury}</span>
                        <strong>{entry.points} puan</strong>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
