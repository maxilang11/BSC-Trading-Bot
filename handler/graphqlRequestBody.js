exports.graphqlRequestBody = function graphqlRequestBody(postId) {
  if (!postId) {
    throw { error: "postId is a required field of followUpRequest" };
  }
  return JSON.stringify({
    operationName: "UserStreamLatest",
    variables: {
      postId,
    },
    query:
      `query UserStreamLatest($postId: ID!) {
        post(id: $postId)  {
              content {
                  bodyModel {
                      paragraphs {
                          text,
                          href
                      }
                  }
              },
          }
      }`,
  });
};