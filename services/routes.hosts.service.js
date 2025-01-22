"use strict";


const DbService = require("@moleculer/database").Service;
const { MoleculerClientError } = require("moleculer").Errors;

const ConfigMixin = require("../mixins/config.mixin");

/**
 * Route hosts service
 */
module.exports = {
	name: "routes.hosts",
	version: 1,

	mixins: [
		DbService({
			createActions: true,
			adapter: {
				type: "NeDB",
				options: "./db/routes.hosts.db"
			}
		}),
		ConfigMixin
	],

	/**
	 * Service dependencies
	 */
	dependencies: [
		{ name: "routes", version: 1 }
	],

	/**
	 * Service settings
	 */
	settings: {
		rest: "/v1/routes/:route/hosts",

		fields: {
			route: {
				type: "string",
				required: true,
				immutable: true,
				populate: {
					action: "v1.routes.resolve",
					params: {
						fields: ["id", "name", "vHost", "auth"]
					}
				},
			},

			hostname: {
				type: "string",
				empty: false,
				required: true,
			},
			port: {
				type: "number",
				required: true
			},

			weight: {
				type: "number",
				default: 200,
				required: false
			},
			vnodes: {
				type: "number",
				default: 50,
				required: false
			},

			group: {
				type: "enum",
				default: "BLUE",
				values: ["BLUE", 'GREEN'],
				required: false
			},

			protocol: {
				type: "enum",
				default: "http:",
				values: ["http:", 'https:'],
				required: false
			},

			cluster: {
				type: "string",
				default: "default",
				required: false
			},


			id: { type: "string", primaryKey: true, columnName: "_id" },
			createdAt: {
				type: "number",
				readonly: true,
				onCreate: () => Date.now(),
				columnType: "double"
			},
			updatedAt: {
				type: "number",
				readonly: true,
				onUpdate: () => Date.now(),
				columnType: "double"
			},
			deletedAt: { type: "number", readonly: true, onRemove: () => Date.now() }
		},

		scopes: {
			notDeleted: {
				deletedAt: { $exists: false }
			},
		},

		defaultScopes: ["notDeleted"],

		config: {

		}
	},

	/**
	 * Actions
	 */

	actions: {

		/**
		 * Lookup hosts by route
		 *
		 * @actions
		 * @param {String} route - route id
		 * 
		 * @returns {Object} Hosts
		 */
		lookup: {
			rest: {
				method: "GET",
				path: "/lookup",
			},
			params: {
				route: { type: "string", empty: false, optional: false }
			},
			async handler(ctx) {
				const routeID = ctx.params.route;
				const hosts = await this.findEntities(ctx, {
					query: { route: routeID },
				});
				return hosts;
			}
		}
	},

	/**
	 * Events
	 */
	events: {
		async "routes.removed"(ctx) {
			const route = ctx.params.data;

			const attachments = await this.findEntities(ctx, {
				query: { route: route.id },
				fields: ["id"]
			});
			await this.Promise.all(
				attachments.map(attachment => this.removeEntity(ctx, { id: attachment.id }))
			);

			this.logger.info(`Removed ${attachments.length} attachments for route ${route.id}`);
		},
	},

	/**
	 * Methods
	 */
	methods: {

	},

	/**
	 * Service created lifecycle event handler
	 */
	created() { },

	/**
	 * Service started lifecycle event handler
	 */
	started() { },

	/**
	 * Service stopped lifecycle event handler
	 */
	stopped() { }
};