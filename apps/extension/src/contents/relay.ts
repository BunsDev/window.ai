import {
  ContentMessageType,
  PortName,
  PortResponse
} from "apps/extension/src/core/constants"
import { log } from "apps/extension/src/core/utils/utils"
import { Extension, type Port } from "apps/extension/src/platforms/extension"
import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  run_at: "document_start"
}

type PublicPort = PortName.Completion | PortName.Model

const ports: Record<PublicPort, Port> = {
  [PortName.Completion]: Extension.connectToPort(PortName.Completion),
  [PortName.Model]: Extension.connectToPort(PortName.Model)
}

;(Object.keys(ports) as PublicPort[]).forEach((portName) =>
  // Handle responses from background script
  Extension.addPortListener<typeof portName, PortResponse>(
    portName,
    (msg) => {
      if (!("response" in msg)) {
        // TODO handle invalid requests
        throw `Invalid request: ${msg}`
      }
      const { id, response } = msg
      window.postMessage(
        {
          type: ContentMessageType.Response,
          portName,
          id,
          response
        },
        "*"
      )
    },
    ports[portName]
  )
)

// Handle requests from content script
window.addEventListener("message", (event) => {
  const { source, data } = event

  // We only accept messages our window and a port

  const port = ports[data.portName as PublicPort]
  if (source !== window || !port) {
    return
  }

  const { type } = data

  switch (type) {
    case ContentMessageType.Request:
    case ContentMessageType.Cancel:
      log(`Relay received ${type}: `, data)
      Extension.sendMessage(data, port)
      break
    case ContentMessageType.Response:
      // Handled by inpage script
      break
  }
})