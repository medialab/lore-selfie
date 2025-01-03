

export interface Creator {
  id: String
  channels: Array<String>
  name: String
  description: String
  links: Object
}
export interface Annotations {
  creators: Object
  tags: Object
  expressions: Object
}

export interface Query {
  id: String
  query: String
}

export interface Expression {
  id: String
  name: String
  definition: String
  queries: Array<Query>
  links: Object
}

export interface Tag {
  id: String
  color: String
  name: String
  description: String
}