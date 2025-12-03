// Core Imports
import React, { useState, useCallback } from "react"
import { useMediaQuery } from "@material-ui/core"
import VegaLite from "react-vega-lite"

export default function Sparkline({ ...props }) {
  const print = useMediaQuery("print")
  const [parentHeight, setParentHeight] = useState(null)
  const [parentWidth, setParentWidth] = useState(null)

  const div = useCallback((node) => {
    if (node !== null) {
      setParentHeight(node.getBoundingClientRect().height)
      setParentWidth(node.getBoundingClientRect().width)
    }
  }, [])

  let details = []
  ;(props.data || []).map((data) => {
    if (typeof data?.x === "string") {
      let propsDate = new Date(data?.x?.replace("at ", ""))
      let timeString = propsDate.toLocaleTimeString()
      let curreDate = propsDate.getDate().toString().padStart(2, "0")
      let curreMonth = (propsDate.getMonth() + 1).toString().padStart(2, "0")
      let curreYear = propsDate.getFullYear()
      let dateTimeString = `${curreMonth}/${curreDate}/${curreYear}, ${timeString}`
      data.x = dateTimeString
      details.push(data)
    } else {
      details.push(data)
    }
  })

  const width = Math.max(props.minWidth, parentWidth + (print ? 128 : 0))
  const height = Math.max(props.minHeight, parentHeight ? parentHeight : 0)

  const spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "Sparkline area chart",
    background: "#00000000",
    width,
    height,

    config: {
      view: { stroke: "transparent" },
      axis: {
        labelColor: "rgba(0, 0, 0, 0.4)",
        labelFont: "Inter",
        labelFontWeight: 500,
        labelFontSize: 10,
        labelPadding: 4,
        title: null,
        grid: false,
      },
    },

    mark: {
      type: "area",
      point: { color: "#2196f3", size: 50 },
      line: { color: "#2196f3", strokeDash: [3, 1] },
      tooltip: true,
      color: {
        gradient: "linear",
        x1: 1,
        y1: 1,
        x2: 1,
        y2: 0,
        stops: [
          { offset: 0, color: "#ffffff00" },
          { offset: 1, color: props.color },
        ],
      },
    },

    encoding: {
      x: { field: "x", type: "ordinal" },
      y: { field: "y", type: "quantitative" },
      tooltip: [
        { field: "x", type: "ordinal", title: "DATE" },
        { field: "y", type: "quantitative", title: "SCORE" },
      ],
    },

    data: { values: props.values ?? details },
  }

  return (
    <div ref={div}>
      <VegaLite spec={spec} renderer="canvas" actions={false} />
    </div>
  )
}
