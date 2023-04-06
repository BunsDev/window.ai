import { NoActivity } from "apps/extension/src/core/components/NoActivity"
import { useInfiniteScroll } from "apps/extension/src/core/components/hooks/useInfiniteScroll"
import { HorizontalMenu } from "apps/extension/src/core/components/pure/HorizontalMenu"
import { Logo } from "apps/extension/src/core/components/pure/Logo"
import { Skeleton } from "apps/extension/src/core/components/pure/Skeleton"
import { SlidingPane } from "apps/extension/src/core/components/pure/SlidingPane"
import { Text } from "apps/extension/src/core/components/pure/Text"
import { Origin, originManager } from "apps/extension/src/core/managers/origin"
import { useRef, useState } from "react"

import { AppsItem } from "./AppsItem"

type Filter = "my-apps" | "trending" | "all"

export function Apps() {
  const { objects, loading, appendNextPage } = originManager.useObjects(20)
  const [filter, setFilter] = useState<Filter>("my-apps")
  const [selectedApp, selectApp] = useState<Origin | undefined>()
  const filteredApps = objects.filter((o) => filter === "my-apps")
  const loaderRef = useRef<HTMLDivElement>(null)

  useInfiniteScroll(loaderRef, appendNextPage, objects.length > 0)

  return (
    <div>
      {/* <HorizontalMenu<Filter>
        className="absolute top-0 left-0 right-0"
        items={[
          { label: "My Apps", value: "my-apps" },
          // { label: "Trending", value: "trending" },
          { label: "All (coming soon)", value: "all" }
        ]}
        currentItem={filter}
        onItemSelect={(f) => setFilter(f)}
      /> */}

      {/* <div className="mb-8" /> */}

      {filteredApps.map((origin: Origin) => (
        <AppsRow
          key={origin.id}
          origin={origin}
          onSelect={() => selectApp(origin)}
        />
      ))}

      {filteredApps.length === 0 && !loading && <NoActivity />}

      <div ref={loaderRef}>{loading && <Skeleton />}</div>

      <SlidingPane shown={!!selectedApp} onHide={() => selectApp(undefined)}>
        {selectedApp && <AppsItem origin={selectedApp} />}
      </SlidingPane>
    </div>
  )
}

function AppsRow({
  origin,
  onSelect
}: {
  origin: Origin
  onSelect: () => void
}) {
  return (
    <div
      className={`p-2 h-[4rem] grid grid-cols-7 cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-700`}
      onClick={onSelect}>
      <Logo
        className="self-start mx-2 my-1 w-5 rounded-full"
        faviconFor={origin.domain}
      />
      <div className="col-span-6">
        <Text truncate>{originManager.originDisplay(origin)}</Text>
        <Text lines={2} size="xs" dimming="less">
          {origin.title} {originManager.url(origin)}
        </Text>
      </div>
    </div>
  )
}