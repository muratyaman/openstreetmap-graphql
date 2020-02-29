export default `

type Tags {
  name: String
  website: String
  wikipedia: String
  tourism: String
}

type Node {
  type: String!
  id: ID!
  lat: Float
  lon: Float
  tags: Tags
}

type Way {
  type: String!
  id: ID!
  lat: Float
  lon: Float
  tags: Tags
}

type Relation {
  type: String!
  id: ID!
  lat: Float
  lon: Float
  tags: Tags
}

union Element = Node | Way | Relation

type Query {
  hello: String

  node(id: Int!): Element
  
  way(id: Int!): Element
  
  relation(id: Int!): Element
  
  search(lat: Float!, lon: Float!): [Element]
  
  searchNodes(lat: Float!, lon: Float!): [Node]
  
  searchWays(lat: Float!, lon: Float!): [Way]
  
  searchRelations(lat: Float!, lon: Float!): [Relation]

}

`;
