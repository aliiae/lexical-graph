import * as d3 from 'd3';
import { HierarchyNode, POS, RelationType, TypeToHierarchy } from '../../../api/types';
import WordnetAPI from '../../../api/WordnetAPI';
import { replaceUnderscores } from '../../../util/wordnet';

type HierarchyDatum = { label: string; children?: HierarchyDatum[]; type?: string };
const color = d3.scaleOrdinal(d3.schemeDark2);

export function clearGraph(): void {
  const svg = d3.select('.graph').select('svg');
  svg.selectAll('*').remove();
}

export function mergeGraphData(data: TypeToHierarchy, lemma: string): HierarchyNode {
  const children: HierarchyNode[] = [];
  Object.keys(data).forEach((type: string) => {
    const { children: typeChildren } = data[type];
    if (typeChildren) {
      typeChildren.forEach((child) => {
        children.push((child));
      });
    }
  });
  const pos: POS = (lemma.substring(0, 1) as POS);
  return {
    label: `${replaceUnderscores(lemma.substring(2))} (${WordnetAPI.posMap[pos]})`,
    children,
  };
}

export function draw(data: HierarchyNode): void {
  const svg = d3.select('.graph').select('svg');

  const width = 750;
  const height = 500;

  // @ts-ignore
  data.x = width / 2;
  // @ts-ignore
  data.y = 120;
  const root: d3.HierarchyNode<HierarchyDatum> = d3.hierarchy(data);
  // @ts-ignore
  root.x = height / 2;
  // @ts-ignore
  root.y = 0;
  const links: d3.HierarchyLink<HierarchyDatum>[] = root.links();
  const nodes: d3.HierarchyNode<HierarchyDatum>[] = root.descendants();

  // @ts-ignore
  const simulation = d3.forceSimulation(nodes)
  // @ts-ignore
    .force('link', d3.forceLink(links).id((d: d3.HierarchyLink<HierarchyDatum>) => d.id)
      .distance(0).strength(1))
    // @ts-ignore
    .force('charge', d3.forceManyBody().strength(-80))
    .force('center', d3.forceCenter())
    .force('collide', d3.forceCollide((d: any) => {
      if (!d.children) {
        return 25;
      }
      return 15;
    }))
    .force('x', d3.forceX())
    .force('y', d3.forceY())
    .alphaDecay(0.1);

  svg
    .attr('id', 'svg')
    .attr('preserveAspectRatio', 'xMinYMin')
    // @ts-ignore
    .attr('viewBox', [-width / 2, -height / 2, width, height]);

  const container = svg.append('g');

  const link = container.append('g')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('class', 'edge');

  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0)
    .style('display', 'none');

  const node = container.append('g')
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('class', 'node')
    // @ts-ignore
    .attr('fill', getNodeColor)
    .attr('stroke', getStrokeColor)
    .attr('r', getNodeSize)
    // @ts-ignore
    .call(drag(simulation))
    .on('touchmove mouseover', (d: d3.HierarchyNode<HierarchyDatum>) => {
      if (d.data.label === '_SYNSET') {
        return;
      }
      let html = `<b>${d.data.label}</b>`;
      let { parent } = d;
      while (parent && parent.data.label === '_SYNSET') {
        parent = parent.parent;
      }
      if (parent) {
        html += `<br/>${d.data.type} of <em>${parent.data.label}</em>`;
      }
      tooltip
        .transition()
        .duration(200)
        .style('opacity', 1)
        .style('display', 'block');
      // @ts-ignore
      tooltip.html(html)
        .style('left', `${d3.event.pageX + 5}px`)
        .style('top', `${d3.event.pageY - 28}px`);
    })
    .on('touchend mouseleave mouseout', () => {
      tooltip
        .transition()
        .duration(200)
        .style('opacity', 0)
        .style('display', 'none');
    });

  const text = container.append('g')
    .selectAll('text')
    .data(nodes)
    .join('text')
    .attr('class', 'label')
    .attr('dx', 10)
    .attr('dy', '.35em');

  text.append('a')
    .attr('xlink:href', (d) => `/${getLabel(d)}`)
    .text(getLabel)
    .attr('fill', (d: d3.HierarchyNode<HierarchyDatum>) => (d.parent ? getNodeColor(d) : '#000'))
    .each(function(d: d3.HierarchyNode<HierarchyDatum>) {
      wrap.call(this, d);
    });

  simulation.on('tick', () => {
    // Make it appear as a tree
    const kx = 0.4 * simulation.alpha();
    const ky = 1.4 * simulation.alpha();
    links.forEach((d: any) => {
      d.target.x += (d.source.x - d.target.x) * kx;
      d.target.y += (d.source.y + 80 - d.target.y) * ky;
    });
    link
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y);
    transform(node);
    transform(text);
  });

  const zoom = d3.zoom()
    .extent([[0, 0], [width, height]])
    .scaleExtent([0.5, 20])
    .on('zoom', () => {
      svg.attr('transform', d3.event.transform);
    });
  // @ts-ignore
  svg.call(zoom);
}

function getLabel(d: d3.HierarchyNode<HierarchyDatum>): string {
  if (!d.data.label || d.data.label.startsWith('_')) {
    return '';
  }
  return d.data.label;
}

function transform(selection: any): void {
  selection.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
}

function drag(simulation: d3.Simulation<any, undefined>) {
  function dragstarted(d: any) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d: any) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d: any) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);
}

function wrap(d: d3.HierarchyNode<HierarchyDatum>): void {
  // @ts-ignore
  if (d.data.label === '_SYNSET') {
    return;
  }
  const words = d.data.label.split(/\s+/);
  if (words.length < 2) {
    return;
  }
  // @ts-ignore
  const selection = d3.select(this);
  const dy = 0;
  selection.text(null);
  const lineHeight = 0.8;
  words.forEach((word: string, i) => {
    selection.append('tspan')
      .attr('x', 0)
      .attr('dx', 10)
      .attr('dy', `${Number(i > 0) * lineHeight + dy}em`)
      .text(word);
  });
}

function getNodeColor(d: d3.HierarchyNode<HierarchyDatum>): string {
  if (!d.parent) {
    return '#fff';
  }
  switch (d.data.label) {
    case '_SYNSET': {
      return '#fff';
    }
    case undefined: {
      return '#000';
    }
    default: {
      return d.data.type ? WordnetAPI.colors[(d.data.type as RelationType)] : color('undefined');
    }
  }
}

function getStrokeColor(d: d3.HierarchyNode<HierarchyDatum>): string {
  if (!d.parent) {
    return '#000';
  }
  switch (d.data.label) {
    case '_SYNSET': {
      return '#2e2e2e';
    }
    default: {
      return '#000';
    }
  }
}

function getNodeSize(d: d3.HierarchyNode<HierarchyDatum>): number {
  if (!d.parent) {
    return 7;
  }
  switch (d.data.label) {
    case '_SYNSET': {
      return 1;
    }
    default: {
      return 3;
    }
  }
}
