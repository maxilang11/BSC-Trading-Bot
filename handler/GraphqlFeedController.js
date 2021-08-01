const fetch = require("node-fetch");

const {
  graphqlRequestBody
} = require("./graphqlRequestBody");

class GraphqlFeedController {
  getGraphqlFeedPath() {
    return "https://medium.com/_/graphql";
  }

  adaptPost(post) {
    return post.data.post.content.bodyModel.paragraphs;
  }

  getParagraphsFromPostId(postId) {
    return fetch(this.getGraphqlFeedPath(), {
      method: "POST",
      body: graphqlRequestBody(postId),
      headers: { "Content-Type": "application/json" }
    })
      .then(response => response.json())
      .then(post => this.adaptPost(post));
  }
}

exports.GraphqlFeedController = GraphqlFeedController;