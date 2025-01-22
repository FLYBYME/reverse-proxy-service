"use strict";


const DbService = require("@moleculer/database").Service;
const { MoleculerClientError } = require("moleculer").Errors;

const ConfigMixin = require("../mixins/config.mixin");

/**
 * Routes service
 */
module.exports = {
	name: "routes",
	version: 1,

	mixins: [
		DbService({
			createActions: true,
			adapter: {
				type: "NeDB",
				options: "./db/routes.db"
			}
		}),
		ConfigMixin
	],

	/**
	 * Service dependencies
	 */
	dependencies: [],

	/**
	 * Service settings
	 */
	settings: {
		rest: "/v1/routes",


		fields: {

			vHost: {
				type: "string",
				min: 3,
				lowercase: true,
				required: true,
			},

			zone: {
				type: "string",
				default: null,
				required: false
			},

			certs: {
				type: "boolean",
				default: true,
				required: false
			},
			auth: {
				type: "string",
				default: null,
				required: false
			},

			strategy: {
				type: "enum",
				default: 'LatencyStrategy',
				values: ["RandomStrategy", "IPHashStrategy", "LatencyStrategy", "RoundRobinStrategy"],
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
		 * Lookup a route by vHost
		 *
		 * @param {string} vHost - vHost
		 * 
		 * @returns {Object} Route
		 */
		lookup: {
			rest: {
				method: "GET",
				path: "/lookup",
			},
			params: {
				vHost: { type: "string", empty: false },
			},
			async handler(ctx) {
				const found = await this.findEntity(ctx, {
					query: {
						vHost: ctx.params.vHost
					}
				});
				if (!found) {
					throw new MoleculerClientError(
						`Route ${ctx.params.vHost} not found`,
						404,
						"ROUTE_NOT_FOUND",
						{ vHost: ctx.params.vHost }
					);
				}

				return found;
			}
		}
	},


	/**
	 * Events
	 */
	events: {

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
