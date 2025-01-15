

export interface Creator {
  id: string
  channels: Array<string>
  name: string
  description: string
  links: {
    tags: Array<string>
  }
}

export interface Expression {
  id: string
  name: string
  definition: string
  queries: Array<Query>
  links: {
    tags: Array<string>
    creators: Array<string>
  }
}

export interface Tag {
  id: string
  color: string
  name: string
  description: string
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
  id: string
  query: string
}