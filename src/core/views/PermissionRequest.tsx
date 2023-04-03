import { KeyIcon } from "@heroicons/react/24/solid"
import { useEffect, useState } from "react"

import { Accordion } from "~core/components/pure/Accordion"
import { Button } from "~core/components/pure/Button"
import { Dropdown } from "~core/components/pure/Dropdown"
import { Text } from "~core/components/pure/Text"
import type { PortName, PortResponse } from "~core/constants"
import { LLMLabels, configManager } from "~core/managers/config"
import { originManager } from "~core/managers/origin"
import { Transaction, transactionManager } from "~core/managers/transaction"
import { useNav } from "~core/providers/nav"
import type { ModelID } from "~public-interface"

export function PermissionRequest({
  data,
  onResult
}: {
  data: PortResponse[PortName.Permission]
  onResult: (response: boolean) => void
}) {
  const [transaction, error] =
    "error" in data
      ? [undefined, data.error]
      : [data.request.transaction, undefined]

  return (
    // TODO figure out why hfull doesn't work
    <div className="flex flex-col h-[92%]">
      <div className="flex-auto flex flex-col overflow-y-auto overflow-x-hidden items-center justify-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900">
          <KeyIcon className="w-8 h-8 text-slate-500 dark:text-slate-400" />
        </div>
        <div className="mt-4 flex flex-col items-center w-full">
          <Text size="lg" strength="medium">
            Permission Request
          </Text>
          {transaction ? (
            <TransactionPermission transaction={transaction} />
          ) : (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Error: {error}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mx-4">
        <Button appearance="secondary" onClick={() => onResult(false)}>
          Deny
        </Button>
        <Button appearance="primary" onClick={() => onResult(true)}>
          Allow
        </Button>
      </div>
    </div>
  )
}

function TransactionPermission({ transaction }: { transaction: Transaction }) {
  const { setSettingsShown } = useNav()
  const { object, setObject } = originManager.useObject(transaction.origin.id)
  const requestedModel = transaction.model
  const [model, setModel] = useState<ModelID | undefined>(requestedModel)

  useEffect(() => {
    async function checkConfig() {
      const config = requestedModel
        ? await configManager.getOrInit(requestedModel)
        : await configManager.getDefault()
      setModel(config.id)
      if (configManager.isIncomplete(config)) {
        setSettingsShown(true)
      }
    }
    checkConfig()
  }, [requestedModel])

  return (
    <div className="flex flex-col items-center text-center">
      <Text dimming="more" size="lg">
        {originManager.originDisplay(transaction.origin)}
      </Text>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        This app is requesting permission to access{" "}
        {model ? LLMLabels[model] : "your model"}
      </p>
      <Accordion title="View Request">
        <code className="text-xs">
          {JSON.stringify(transactionManager.formatJSON(transaction), null, 2)}
        </code>
      </Accordion>
      <Dropdown
        choices={["ask", "allow"]}
        onSelect={async (permission) =>
          setObject({
            ...transaction.origin,
            permissions: permission
          })
        }>
        {object?.permissions === "allow" ? "Always allow" : "Ask every time"}
      </Dropdown>
    </div>
  )
}
