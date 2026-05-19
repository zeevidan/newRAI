declare module "d3-org-chart" {
  export class OrgChart<T = Record<string, unknown>> {
    container(element: HTMLElement | string): this
    data(data: T[]): this
    render(): this
    fit(options?: { animate?: boolean; nodes?: unknown; scale?: boolean }): this
    expandAll(): this
    collapseAll(): this
    nodeContent(
      fn: (node: OrgChartNodeDatum, index: number, nodes: OrgChartNodeDatum[], state: unknown) => string,
    ): this
    nodeWidth(fn: (node: OrgChartNodeDatum) => number): this
    nodeHeight(fn: (node: OrgChartNodeDatum) => number): this
    childrenMargin(fn: (node: OrgChartNodeDatum) => number): this
    neighbourMargin(fn: (a: OrgChartNodeDatum, b: OrgChartNodeDatum) => number): this
    compact(value: boolean): this
    initialExpandLevel(level: number): this
    svgHeight(height: number): this
    duration(ms: number): this
    linkUpdate(fn: (this: SVGPathElement, node: OrgChartLinkDatum) => void): this
    onNodeClick(fn: (node: OrgChartNodeDatum) => void): this
  }

  export interface OrgChartNodeDatum {
    data: Record<string, unknown>
    width: number
    height: number
    depth: number
    parent?: OrgChartNodeDatum
  }

  export interface OrgChartLinkDatum {
    source: OrgChartNodeDatum
    target: OrgChartNodeDatum
  }
}
