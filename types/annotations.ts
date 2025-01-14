

export interface Creator {
  id: String
  channels: Array<String>
  name: String
  description: String
  links: {
    tags: Array<string>
  }
}

export interface Expression {
  id: String
  name: String
  definition: String
  queries: Array<Query>
  links: {
    tags: Array<string>
    creators: Array<string>
  }
}

export interface Tag {
  id: String
  color: String
  name: String
  description: String
}
export interface Annotations {
  creators: {
    [key: string]: Creator
  }
  tags: {
    [key: string]: Tag
  }
  expressions: {
    [key: string]: Expression
  }
}

export interface Query {
  id: String
  query: String
}