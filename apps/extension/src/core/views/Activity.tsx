import { BeakerIcon } from "@heroicons/react/24/solid"
import { NoActivity } from "apps/extension/src/core/components/NoActivity"
import { useInfiniteScroll } from "apps/extension/src/core/components/hooks/useInfiniteScroll"
import { Logo } from "apps/extension/src/core/components/pure/Logo"
import { Skeleton } from "apps/extension/src/core/components/pure/Skeleton"
import { SlidingPane } from "apps/extension/src/core/components/pure/SlidingPane"
import { Text } from "apps/extension/src/core/components/pure/Text"
import {
  Transaction,
  transactionManager
} from "apps/extension/src/core/managers/transaction"
import { useRef, useState } from "react"
import React from "react"

import { ActivityItem } from "./ActivityItem"

export function Activity() {
  const [selectedTxn, selectTxn] = useState<Transaction | undefined>()
  const { objects, loading, appendNextPage } = transactionManager.useObjects(7)

  const loaderRef = useRef<HTMLDivElement>(null)

  useInfiniteScroll(loaderRef, appendNextPage, objects.length > 0)

  return (
    <div>
      {objects.map((txn: Transaction) => (
        <ActivityRow
          key={txn.id}
          transaction={txn}
          onSelect={() => selectTxn(txn)}
        />
      ))}

      {objects.length === 0 && !loading && <NoActivity />}

      <div ref={loaderRef}>{loading && <Skeleton />}</div>

      <SlidingPane shown={!!selectedTxn} onHide={() => selectTxn(undefined)}>
        {selectedTxn && <ActivityItem transaction={selectedTxn} />}
      </SlidingPane>
    </div>
  )
}

function ActivityRow({
  transaction,
  onSelect
}: {
  transaction: Transaction
  onSelect: () => void
}) {
  const input = transactionManager.formatInput(transaction)
  const output = transactionManager.formatOutput(transaction)
  return (
    <div
      className={`p-2 h-[4.5rem] grid grid-cols-7 cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-700`}
      onClick={onSelect}>
      <Logo
        className="self-start mx-2 my-1 w-5 rounded-full"
        faviconFor={transaction.origin.domain}
      />
      <div className="col-span-6">
        <Text truncate>{input}</Text>
        <Text lines={2} size="xs" dimming="less">
          {output === undefined ? (
            <span className="italic">No response</span>
          ) : (
            output
          )}
        </Text>
      </div>
    </div>
  )
}