
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const initialCountries = [
  "France",
  "Norway",
  "Germany",
  "Japan",
  "Greece",
  "Switzerland",
  "Austria",
  "Malta",
  "Bosnia & Herzegovina",
  "Estonia",
  "Turkiye",
  "Kazakhstan",
  "Denmark",
  "Poland",
  "San Marino",
  "Azerbaijan",
];

const tabs = [
  "Dashboard",
  "Results",
  "Control",
  "Phases",
  "Countries",
  "Voters",
] as const;

type Tab = (typeof tabs)[number];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("Dashboard");
  const [phase, setPhase] = useState("Quarter Final 1");
  const [isOpen, setIsOpen] = useState(true);
  const [countries, setCountries] = useState(initialCountries);
  const [newCountry, setNewCountry] = useState("");
  const [notice, setNotice] = useState("");
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  function addCountry() {
    const name = newCountry.trim();
    if (!name) return;

    if (countries.some((country) => country.toLowerCase() === name.toLowerCase())) {
      setNotice("Bu ülke zaten listede.");
      return;
    }

    setCountries((current) => [...current, name]);
    setNewCountry("");
    setNotice("Ülke listeye eklendi. Şimdilik geçici olarak saklanıyor.");
  }

  function removeCountry(name: string) {
    setCountries((current) => current.filter((country) => country !== name));
    setNotice(`${name} listeden kaldırıldı. Değişiklik şimdilik geçici.`);
  }

  return (
    <main className="min-h-screen bg-[#090614] text-white">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-[#100b23] px-6 py-5 md:px-10">
        <div className="flex items-center gap-3">
          <img
            src="/DivavisionLogo.png"
            alt="Divavision"
            className="h-12 w-auto object-contain"
          />
          <div>
            <h1 className="text-xl font-black tracking-wide">DIVAVISION</h1>
            <p className="text-xs text-violet-300">ADMIN PANEL</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/10"
        >
          Log out ↗
        </button>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 md:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-300">
          Management centre
        </p>
        <h2 className="mt-2 text-3xl font-black md:text-4xl">
          Welcome back, Admin.
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          DivavisionVote yarışmanı buradan yönet.
        </p>

        <nav className="mt-8 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setNotice("");
              }}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab
                  ? "bg-violet-600 text-white"
                  : "border border-white/10 bg-white/[0.03] text-gray-300 hover:bg-white/10"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {notice && (
          <p className="mt-5 rounded-xl border border-violet-400/20 bg-violet-400/10 p-3 text-sm text-violet-200">
            {notice}
          </p>
        )}

        {activeTab === "Dashboard" && (
          <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard title="Current phase" value={phase} />
            <StatCard title="Countries listed" value={String(countries.length)} />
            <StatCard title="Voting status" value={isOpen ? "Open" : "Closed"} />
            <div className="rounded-2xl border border-white/10 bg-[#100b23] p-6 sm:col-span-2 lg:col-span-3">
              <h3 className="text-lg font-bold">Quick overview</h3>
              <p className="mt-2 text-sm leading-6 text-gray-400">
                Bu panelin ilk taslağıdır. Gerçek oy sayıları, sonuçlar ve
                katılımcı kayıtları henüz bir veritabanına bağlı değil.
              </p>
            </div>
          </section>
        )}

        {activeTab === "Results" && (
          <Panel title="Results">
            <p className="text-sm text-gray-400">
              Gerçek oy sonuçları henüz bağlanmadı. Veritabanı ve oy sayma
              sistemi kurulduğunda sonuçlar burada gösterilecek.
            </p>
          </Panel>
        )}

        {activeTab === "Control" && (
          <Panel title="Voting control">
            <p className="mb-5 text-sm text-gray-400">
              Bu anahtar şu an yalnızca panel önizlemesini değiştirir; canlı
              oylama sistemini henüz durdurmaz veya açmaz.
            </p>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold">Voting status</p>
                <p className="text-sm text-gray-400">
                  {isOpen ? "Voting is marked open" : "Voting is marked closed"}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsOpen((current) => !current);
                  setNotice("Önizleme durumu değiştirildi; canlı oylama etkilenmedi.");
                }}
                className="rounded-xl bg-violet-600 px-4 py-2 font-semibold hover:bg-violet-500"
              >
                {isOpen ? "Close preview" : "Open preview"}
              </button>
            </div>
          </Panel>
        )}

        {activeTab === "Phases" && (
          <Panel title="Competition phases">
            <label htmlFor="phase" className="mb-2 block text-sm font-semibold">
              Current phase
            </label>
            <select
              id="phase"
              value={phase}
              onChange={(event) => {
                setPhase(event.target.value);
                setNotice("Aşama önizlemesi değiştirildi; henüz canlı sisteme kaydedilmiyor.");
              }}
              className="w-full max-w-md rounded-xl border border-white/10 bg-[#151027] px-4 py-3 text-white"
            >
              <option>Quarter Final 1</option>
              <option>Quarter Final 2</option>
              <option>Final</option>
            </select>
          </Panel>
        )}

        {activeTab === "Countries" && (
          <Panel title="Countries">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                addCountry();
              }}
              className="mb-6 flex flex-wrap gap-3"
            >
              <input
                value={newCountry}
                onChange={(event) => setNewCountry(event.target.value)}
                placeholder="Country name"
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#151027] px-4 py-3 text-white"
              />
              <button
                type="submit"
                className="rounded-xl bg-violet-600 px-5 py-3 font-bold hover:bg-violet-500"
              >
                Add country
              </button>
            </form>

            <div className="divide-y divide-white/10">
              {countries.map((country) => (
                <div
                  key={country}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <span>{country}</span>
                  <button
                    onClick={() => removeCountry(country)}
                    className="rounded-lg border border-red-400/20 px-3 py-1.5 text-sm text-red-300 hover:bg-red-400/10"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <p className="mt-5 text-xs leading-5 text-gray-500">
              Ülke değişiklikleri şimdilik yalnızca bu sayfa açıkken tutulur;
              sayfayı yenileyince başlangıç listesi geri gelir.
            </p>
          </Panel>
        )}

        {activeTab === "Voters" && (
          <Panel title="Voters">
            <p className="text-sm text-gray-400">
              Henüz oy veren kayıtları bulunmuyor; bu bölüm veritabanı
              bağlandıktan sonra tamamlanacak.
            </p>
          </Panel>
        )}
      </div>
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#100b23] p-6">
      <p className="text-sm text-gray-400">{title}</p>
      <p className="mt-3 break-words text-2xl font-black text-violet-200">
        {value}
      </p>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 rounded-2xl border border-white/10 bg-[#100b23] p-6">
      <h3 className="mb-5 text-xl font-bold">{title}</h3>
      {children}
    </section>
  );
}
