"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const body_parser_1 = __importDefault(require("body-parser"));
const db_1 = require("./lib/db"); // Correct import
const crypto_1 = require("crypto"); // For dynamic salt generation
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = (0, express_1.default)();
        const PORT = Number(process.env.PORT) || 8000;
        // Middleware for parsing JSON
        app.use(body_parser_1.default.json());
        // Create GraphQL Server
        const gqlserver = new server_1.ApolloServer({
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
                    say: (_, args) => `Hey ${args.name}, How are You?`,
                },
                Mutation: {
                    createUser: (_, args) => __awaiter(this, void 0, void 0, function* () {
                        const salt = (0, crypto_1.randomBytes)(16).toString("hex"); // Generate dynamic salt
                        try {
                            yield db_1.prismaClient.user.create({
                                data: {
                                    email: args.email,
                                    firstName: args.firstName,
                                    lastName: args.lastName,
                                    password: args.password,
                                    salt,
                                },
                            });
                            return true;
                        }
                        catch (error) {
                            console.error("Error creating user:", error);
                            return false;
                        }
                    }),
                },
            },
        });
        // Start Apollo Server
        yield gqlserver.start();
        // Basic Route
        app.get("/", (req, res) => {
            res.json({ message: "Server is up and running" });
        });
        // Properly apply Apollo middleware
        app.use("/graphql", (0, express4_1.expressMiddleware)(gqlserver, {
            context: (_a) => __awaiter(this, [_a], void 0, function* ({ req }) { return ({ token: req.headers.authorization }); }),
        }) // Fix TypeScript error
        );
        // Start the server with error handling
        app.listen(PORT, () => {
            console.log(`Server is started at http://localhost:${PORT}`);
        });
    });
}
// Run the initialization function
init().catch((error) => {
    console.error("Failed to start the server:", error);
});
