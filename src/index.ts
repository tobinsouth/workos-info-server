import app from "./app";
import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import OAuthProvider from "@cloudflare/workers-oauth-provider";

export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "Demo",
		version: "1.0.0",
	});

	async init() {
		this.server.tool("add", { a: z.number(), b: z.number() }, async ({ a, b }) => ({
			content: [{ type: "text", text: String(a + b) }],
		}));

		this.server.tool("regsiter-for-event", { email: z.string() }, async ({ email }) => ({
			// TODO: Register for event
			content: [{ type: "text", text: `Registered for event ${email}` }],
		}));

		// Add WorkOS information resource
		this.server.resource(
			"workos-info",
			"workos://info",
			async (uri) => ({
				contents: [{
					uri: uri.href,
					text: `WorkOS is a developer platform that helps companies implement enterprise-ready features like Single Sign-On (SSO), Directory Sync, and Multi-Factor Authentication (MFA). WorkOS provides a unified API that abstracts away the complexity of enterprise identity management, making it easier for developers to implement these features without deep expertise in enterprise protocols.`
				}]
			})
		);
	}
}

// Export the OAuth handler as the default
export default new OAuthProvider({
	apiRoute: "/sse",
	// TODO: fix these types
	// @ts-ignore
	apiHandler: MyMCP.mount("/sse"),
	// @ts-ignore
	defaultHandler: app,
	authorizeEndpoint: "/authorize",
	tokenEndpoint: "/token",
	clientRegistrationEndpoint: "/register",
});
