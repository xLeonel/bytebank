/**
 * Skeleton (shimmer) da home logada — exibido enquanto os dados da conta
 * carregam, no lugar do texto "Carregando sua conta...". Espelha o layout
 * da home (coluna principal + aside de últimas transações).
 */
function Line({ w = "100%", h = "0.9rem" }: { w?: string; h?: string }) {
  return (
    <div
      className="animate-pulse rounded bg-gray-200"
      style={{ width: w, height: h }}
    />
  );
}

export function HomeSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex flex-col gap-6">
        {/* Balance card */}
        <div className="rounded-md bg-[#2b3a28] p-8">
          <div className="flex flex-col gap-4">
            <div className="h-6 w-40 animate-pulse rounded bg-white/20" />
            <div className="h-4 w-52 animate-pulse rounded bg-white/15" />
            <div className="mt-4 h-10 w-48 animate-pulse rounded bg-white/20" />
          </div>
        </div>

        {/* Services */}
        <div className="rounded-md bg-white p-6">
          <Line w="12rem" h="1.1rem" />
          <div className="mt-5 flex gap-4">
            <div className="h-28 flex-1 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-28 flex-1 animate-pulse rounded-lg bg-gray-100" />
          </div>
        </div>

        {/* Charts */}
        <div className="rounded-md bg-white p-6">
          <Line w="10rem" h="1.1rem" />
          <div className="mt-6 h-56 animate-pulse rounded-lg bg-gray-100" />
        </div>
      </div>

      {/* Aside: últimas transações */}
      <aside className="rounded-md bg-white p-6">
        <Line w="10rem" h="1.1rem" />
        <div className="mt-5 flex flex-col gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2 border-b border-gray-100 pb-3">
              <Line w="45%" />
              <Line w="30%" />
              <Line w="60%" h="0.7rem" />
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
