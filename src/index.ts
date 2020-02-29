import express from 'express';
import graphqlHTTP from 'express-graphql';
import { buildSchema } from 'graphql';
import config from './config';
import OsmHttpClient, { Element, Node, Way, Relation, SearchElementsResponse } from './OpenStreetMap/OsmHttpClient';
import graphqlTypeDefs from './OpenStreetMap/graphqlTypeDefs';

const schema = buildSchema(`${graphqlTypeDefs}`);

const osmClient = new OsmHttpClient(config.osm);

const tourismValues = ['museum', 'attraction'];

const searchCore = async (obj, args, context, info): Promise<Element[]> => {
  console.info('searchCore obj', obj);
  // console.info('search args', args);
  // console.info('search context', context);
  // console.info('search info', info);
  const { lat, lon } = obj;

  const response: SearchElementsResponse = await osmClient.searchElements(lat, lon);

  const filtered = response.elements.filter(el => {
    return el && el.tags && el.tags.tourism && tourismValues.includes(el.tags.tourism);
    //return true;
  }).map(el => {
    let position = {};
    if (el && el.bounds) { // el.bounds.minlat && el.bounds.minlon
      position = { lat: el.bounds.minlat, lon: el.bounds.minlon };
    }
    //if (el && el.geometry) {
    //  el.geometry = el.geometry.filter(g => g !== null);
    //}
    return Object.assign({}, el, position);
  });
  console.info('searchCore results', filtered);
  return filtered;
};

const root = {

  hello: () => 'Hello world!',

  async search(obj, args, context, info): Promise<Element[]> {
    const elements = await searchCore(obj, args, context, info);
    console.info('search', elements);
    return elements;
  },

  async searchNodes(obj, args, context, info): Promise<Node[]> {
    const elements = await searchCore(obj, args, context, info);
    const filtered = elements.filter(el => el.type === 'node').map(el => el as Node);
    console.info('searchNodes', filtered);
    return filtered;
  },

  async searchWays(obj, args, context, info): Promise<Way[]> {
    const elements = await searchCore(obj, args, context, info);
    const filtered = elements.filter(el => el.type === 'way').map(el => el as Way);
    console.info('searchWays', filtered);
    return filtered;
  },

  async searchRelations(obj, args, context, info): Promise<Relation[]> {
    const elements = await searchCore(obj, args, context, info);
    const filtered = elements.filter(el => el.type === 'relation').map(el => el as Relation);
    console.info('searchRelations', filtered);
    return filtered;
  },
};

const app = express();

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}) as any);

app.listen(4000, () => {
  const host = 'http://localhost:4000/graphql';
  console.log(`OpenStreetMap GraphQL server running at ${host}`);
});
