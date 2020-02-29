import axios from 'axios';
import querystring from 'querystring';

// @see https://wiki.openstreetmap.org/wiki/Overpass_API

enum EnumType {
  node = 'node',
  way = 'way',
  relation = 'relation',
}

interface IPosition {
  lat: number;
  lon: number;
}

export type Position = IPosition;

interface IBounds {
  minlat: number; // 24.5205857,
  minlon: number; // 54.3931572,
  maxlat: number; // 24.5425261,
  maxlon: number; // 54.4134563,
}

export type Bounds = IBounds;

//interface IBasic extends IPosition {
//  id: number;
//}

interface ITags {

  // "access": "yes",
  ['addr:city']?: string; // "Abu Dhabi",
  // "architect": "Jean Nouvel",
  // "building:min_level": "3",
  // "building:part": "yes",
  // "building:roof:height": "20",
  // "building:roof:material": "metal",
  // "building:roof:shape": "dome",
  // "levels": "6",

  amenity?: string; // "restaurant", "theatre"
  cuisine?: string; // "mexican",

  name?: string; // "Louvre Abu Dhabi", // sometimes Arabic
  ['name:en']?: string; // "Louvre Abu Dhabi",
  operator?: string;// "Abu Dhabi Tourism Development & Investment Company",
  start_date?: string; // "2017-11-08",

  // @see https://wiki.openstreetmap.org/wiki/Key:tourism
  tourism?: string; // "museum", "attraction"

  // @see https://wiki.openstreetmap.org/wiki/Key:attraction
  attraction?: string; // "roller_coaster", "water_slide"

  website?: string; // "http://louvreabudhabi.ae/",
  wikidata?: string; // "Q3176133",
  wikipedia?: string; // "en:Louvre Abu Dhabi" // "fa:خلیج فارس"
  ['wikipedia:en']?: string; // "Persian Gulf"

  type?: string; // "multipolygon",

  natural?: string; // "bay";
}

export type Tags = ITags;

interface IMember {
  type: string; // "way",
  ref: number; // 762934582,
  role: string; // "inner", "outer"
  geometry: Array<Position | null>;
}

export type Member = IMember;

interface INode extends Position {
  type: EnumType.node;
  id: number;
  tags?: Tags;
  bounds?: Bounds; // this prop does not exist for node
  geometry?: Array<Position | null>; // this prop does not exist for node
  members?: Array<Member | null>; // this prop does not exist for way
}

export type Node = INode;

interface IWay {
  type: EnumType.way;
  id: number;
  tags?: Tags;
  bounds?: Bounds;
  geometry?: Array<Position | null>;
  members?: Array<Member | null>; // this prop does not exist for way
}

export type Way = IWay;

interface IRelation {
  type: EnumType.relation;
  id: number;
  bounds?: Bounds;
  members?: Array<Member | null>;
  tags?: Tags;
  geometry?: Array<Position | null>; // this prop does not exist for relation
}

export type Relation = IRelation;

export type Element = Node | Way | Relation;

export interface SearchElementsResponse {
  version: number ;// 0.6;
  generator: string; // "Overpass API 0.7.55.1011 6c2efc30",
  osm3s: {
    timestamp_osm_base: string; // "2020-02-29T11:17:02Z",
    copyright: string; // "The data included in this document is from www.openstreetmap.org. The data is made available under ODbL."
  },
  elements: Array<Element | null>;
}

interface IHttpClientConfig {
  api: string;
  interpreter: string;
}

export default class OsmHttpClient {

  config: IHttpClientConfig;

  constructor(config: IHttpClientConfig) {
    this.config = config;
  }

  async searchElements(lat: number, lon: number): Promise<SearchElementsResponse> {
    try {
      /*
      [timeout:10][out:json];
      (
      node(around:22.5,25.35782,55.38433);
      way(around:22.5,25.35782,55.38433);
      );
      out tags geom(25.35412,55.38133,25.36093,55.38671);
      relation(around:22.5,25.35782,55.38433);
      out geom(25.35412,55.38133,25.36093,55.38671);
      */
      const latref = 25.35782, lonref = 55.38433;
      const difflatmin = latref - 25.35412, difflonmin = lonref - 55.38133;
      const difflatmax = 25.35412 - latref, difflonmax = 55.38671 - lonref;
      const boxlatmin = lat - difflatmin, boxlonmin = lon - difflonmin;
      const boxlatmax = lat - difflatmax, boxlonmax = lon - difflonmax;

      const bounds = `${boxlatmin},${boxlonmin},${boxlatmax},${boxlonmax}`;
      const around = 22.5;
      const dataTemp = [
        `[timeout:10][out:json];`,
        `(`,
        `node(around:${around},${lat},${lon});`,
        `way(around:${around},${lat},${lon});`,
        `);`,
        `out tags geom(${bounds});`,
        `relation(around:${around},${lat},${lon});`,
        `out geom(${bounds});`,
      ];
      const data = dataTemp.join('');
      console.info('data=', data);
      const requestBody = querystring.stringify({ data });
      const options = {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
      };
      const response = await axios.post(this.config.interpreter, requestBody, options);
      const osmJson = response.data as SearchElementsResponse;
      osmJson.elements = osmJson.elements.filter(el => el !== null);
      osmJson.elements = osmJson.elements.map(el => {
        if (el.hasOwnProperty('geometry')) {
          el.geometry = (el as Way).geometry.filter(g => g !== null);
        }
        return el;
      });
      osmJson.elements = osmJson.elements.map(el => {
        if (el.hasOwnProperty('members')) {
          el.members = (el as Relation).members.filter(m => m !== null);
        }
        return el;
      });
      return Promise.resolve(osmJson);
    } catch (err) {
      console.error('searchElements error', err);
    }
  }

  transformElements(elements: Element[]) {
    return elements.filter(el => {
      return el && el.tags && el.tags.tourism && el.tags.tourism === 'museum';
    });
  }

  async getNode(id: number): Promise<INode> {
    try {
      // /[node|way|relation]/#id
      const url = this.config.api + '/node/' + id;
      const response = await axios.get(url);
      const osmXml = response.data;
      return Promise.resolve(osmXml);
    } catch (err) {
      console.error('getNode error', err);
    }
  }

  async getWay(id: number): Promise<INode> {
    try {
      // /[node|way|relation]/#id
      const url = this.config.api + '/way/' + id;
      const response = await axios.get(url);
      const osmXml = response.data;
      return Promise.resolve(osmXml);
    } catch (err) {
      console.error('getWay error', err);
    }
  }

  async getRelation(id: number): Promise<INode> {
    try {
      // /[node|way|relation]/#id
      const url = this.config.api + '/relation/' + id;
      const response = await axios.get(url);
      const osmXml = response.data;
      return Promise.resolve(osmXml);
    } catch (err) {
      console.error('getRelation error', err);
    }
  }
}
