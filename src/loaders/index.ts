import Graph from "../graph";
import { GraphNode } from "../types";

export default abstract class GraphLoader<T, U extends GraphNode> {
  abstract parseGraph(graph: T): Graph<U>;
  abstract loadGraphFromString(str: string): T;

  fromString(str: string) {
    const graph = this.loadGraphFromString(str);
    return this.parseGraph(graph);
  }

  async fromURI(uri: string, options?: RequestInit) {
    const resp = await fetch(uri, options);

    if (!resp.ok) {
      throw Error(`Error requesting ${uri}: ${resp.status} ${resp.statusText}`);
    }

    const str = await resp.text();
    const graph = await this.loadGraphFromString(str);

    return this.parseGraph(graph);
  }
}
