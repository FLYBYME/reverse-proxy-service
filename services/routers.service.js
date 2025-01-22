"use strict";

const DbService = require("@moleculer/database").Service;
const { MoleculerClientError } = require("moleculer").Errors;
const Context = require("moleculer").Context;

const ConfigMixin = require("../mixins/config.mixin");

/**
 * 
 */
module.exports = {
	/**
	 * Service name
	 */
	name: "routes.routers",

	/**
	 * Version number
	 */
	version: 1,

	mixins: [
		DbService({
			createActions: true,
			adapter: {
				type: "NeDB",
				options: "./db/routes.routers.db"
			}
		}),
		ConfigMixin
	],

	/**
	 * Service dependencies
	 */
	dependencies: [

	],
	/**
	 * Service settings
	 */
	settings: {
		rest: "/v1/routes/routers/",

		fields: {

			// router name
			name: {
				type: "string",
				required: true,
				unique: true
			},

			// router type
			type: {
				type: "string",
				required: false,
				enum: [
					"dedicated", "shared"
				],
				default: "shared"
			},

			// router node
			node: {
				type: "string",
				required: true,
				populate: {
					action: "v1.k8s.nodes.resolve"
				}
			},

			// router address
			address: {
				type: "string",
				required: true,
				populate: {
					action: "v1.k8s.addresses.resolve"
				}
			},

			// router namespace
			namespace: {
				type: "string",
				required: true,
				populate: {
					action: "v1.k8s.namespaces.resolve"
				}
			},

			// router cluster
			cluster: {
				type: "string",
				required: true,
				populate: {
					action: "v1.k8s.clusters.resolve"
				}
			},

			// router status
			status: {
				type: "string",
				required: false,
				enum: [
					"active", "inactive", "deleted", "pending", "banned", "created"
				],
				default: "pending"
			},

			// router pod
			pod: {
				type: "string",
				required: false,
				populate: {
					action: "v1.k8s.pods.resolve"
				}
			},

			// router routes
			routes: {
				type: "array",
				required: false,
				default: [],
				populate: {
					action: "v1.routes.resolve"
				}
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
			"routes.routers.namespace": "1OD3E7rd1Qh8gM08j0Le"
		}
	},

	/**
	 * hooks
	 */
	hooks: {
		before: {
			create: [

			]
		},
		after: {
			create: [

			]
		}
	},

	/**
	 * Actions
	 */

	actions: {
		
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
	async started() {

	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {

	}
};
