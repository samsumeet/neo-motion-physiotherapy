process.env.MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://example:example@example.mongodb.net/neomotion?retryWrites=true&w=majority";

const handler = require("../api/book");

function createResponse(label) {
  return {
    statusCode: 200,
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      console.log(label, JSON.stringify({ statusCode: this.statusCode, payload }, null, 2));
      return this;
    }
  };
}

async function run() {
  await handler({ method: "GET" }, createResponse("GET"));
  await handler({ method: "POST", body: {} }, createResponse("POST_INVALID"));
}

run().catch((error) => {
  console.error("test-book-api failed:", error);
  process.exit(1);
});
