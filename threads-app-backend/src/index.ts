import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import bodyParser from "body-parser";
import { prismaClient } from "./lib/db"; // Correct import
import { randomBytes } from "crypto"; // For dynamic salt generation

async function init() {
  const app = express();
  const PORT = Number(process.env.PORT) || 8000;

  // Middleware for parsing JSON
  app.use(bodyParser.json());

  // Create GraphQL Server
  const gqlserver = new ApolloServer({
    typeDefs: `
      type Query {
        hello: String
        say(name: String): String
      }
      type Mutation {
        createUser(firstName: String!, lastName: String!, email: String!, password: String!): Boolean
      }
    `,
    resolvers: {
      Query: {
        hello: () => `Hey I am a GraphQL Server`,
        say: (_: any, args: { name: string }) =>
          `Hey ${args.name}, How are You?`,
      },
      Mutation: {
        createUser: async (
          _: any,
          args: {
            firstName: string;
            lastName: string;
            email: string;
            password: string;
          }
        ) => {
          const salt = randomBytes(16).toString("hex"); // Generate dynamic salt
          try {
            await prismaClient.user.create({
              data: {
                email: args.email,
                firstName: args.firstName,
                lastName: args.lastName,
                password: args.password,
                salt,
              },
            });
            return true;
          } catch (error) {
            console.error("Error creating user:", error);
            return false;
          }
        },
      },
    },
  });

  // Start Apollo Server
  await gqlserver.start();

  // Basic Route
  app.get("/", (req, res) => {
    res.json({ message: "Server is up and running" });
  });

  // Properly apply Apollo middleware
  app.use(
    "/graphql",
    expressMiddleware(gqlserver, {
      context: async ({ req }) => ({ token: req.headers.authorization }),
    }) as express.RequestHandler // Fix TypeScript error
  );

  // Start the server with error handling
  app.listen(PORT, () => {
    console.log(`Server is started at http://localhost:${PORT}`);
  });
}

// Run the initialization function
init().catch((error) => {
  console.error("Failed to start the server:", error);
});
