"use strict";

const DbService = require("@moleculer/database").Service;
const { MoleculerClientError } = require("moleculer").Errors;
const Context = require("moleculer").Context;

const { hostPort } = require("nats/lib/nats-base-client/servers");
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
					action: "v1.nodes.resolve"
				}
			},

			// router cluster
			cluster: {
				type: "string",
				required: true,
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

			// router pod uid
			pod: {
				type: "string",
				required: false,
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
			"routes.routers.namespace": "routers",
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

		/**
		 * Create router pod
		 * 
		 * @param {Object} ctx - moleculer context
		 * @param {String} id - router id
		 * 
		 * @returns {Object} router object
		 */
		createPod: {
			rest: {
				method: "POST",
				path: "/:id/create-pod",
			},
			params: {
				id: { type: "string", empty: false, optional: true },
			},
			async handler(ctx) {
				const router = await this.resolveEntities(ctx, { id: ctx.params.id });
				if (!router) {
					throw new MoleculerClientError(
						`Router ${ctx.params.id} not found`,
						404, "ROUTER_NOT_FOUND", { id: ctx.params.id }
					);
				}
				return this.createRouterPod(ctx, router);
			}
		},
		/**
		 * Delete router pod
		 * 
		 * @param {Object} ctx - moleculer context
		 * @param {String} id - router id
		 * 
		 * @returns {Object} router object
		 */
		deletePod: {
			rest: {
				method: "POST",
				path: "/:id/delete-pod",
			},
			params: {
				id: { type: "string", empty: false, optional: true },
			},
			async handler(ctx) {
				const router = await this.resolveEntities(ctx, { id: ctx.params.id });
				if (!router) {
					throw new MoleculerClientError(
						`Router ${ctx.params.id} not found`,
						404, "ROUTER_NOT_FOUND", { id: ctx.params.id }
					);
				}
				return this.deleteRouterPod(ctx, router);
			}
		}
	},

	/**
	 * Events
	 */
	events: {
		async "kubernetes.pods.deleted"(ctx) {
			const pod = ctx.params;
		},
		async "kubernetes.pods.added"(ctx) {
			const pod = ctx.params;
		},

		async "kubernetes.pods.modified"(ctx) {
			const pod = ctx.params;
			if (pod.metadata.namespace !== this.config.get("routes.routers.namespace")) {
				return;
			}

			const router = await this.resolvePod(ctx, pod.metadata.uid);
			if (!router) {
				return;
			}

			// Update pod status
			if (pod.status.phase === "Running" && router.status !== "active") {
				await this.updateEntity(ctx, {
					id: router.id,
					status: "active"
				});

				this.logger.info(`Router ${router.id} is active`);
			} else if (pod.status.phase !== "Running" && router.status !== "inactive") {
				await this.updateEntity(ctx, {
					id: router.id,
					status: "inactive"
				});

				this.logger.info(`Router ${router.id} is inactive`);
			}
		}
	},

	/**
	 * Methods
	 */
	methods: {
		/**
		 * Resolve router by uid
		 * 
		 * @param {Object} ctx - moleculer context
		 * @param {String} uid - router pod uid
		 * 
		 * @returns {Object} router object
		 */
		async resolvePod(ctx, uid) {
			return this.findEntity(ctx, {
				query: {
					pod: uid
				}
			});
		},
		/**
		 * Create router pod
		 * 
		 * @param {Object} ctx - moleculer context
		 * @param {Object} router - router object
		 * 
		 * @returns {Object} router object
		 */
		async createRouterPod(ctx, router) {
			const node = await ctx.call("v1.nodes.resolve", {
				id: router.node
			});
			if (!node) {
				throw new MoleculerClientError(
					`Node ${router.node} not found`,
					404, "NODE_NOT_FOUND", { id: router.node }
				);
			}


			const metadata = {
				name: router.name,
				namespace: this.config.get("routes.routers.namespace"),
				labels: {
					"app": "moleculer",
					"moleculer": "router",
					"moleculer-router": router.name,
					"moleculer-cluster": router.cluster
				}
			};

			const container = {
				name: "router",
				image: "ghcr.io/flybyme/reverse-proxy-service:main",
				imagePullPolicy: 'Always',
				command: [
					"npm",
					"run",
					"agent"
				],
				resources: {
					requests: {
						cpu: '10m',
						memory: '64Mi'
					},
					limits: {
						cpu: '100m',
						memory: '256Mi'
					}
				},
				ports: [
					{
						name: "http",
						containerPort: 80,
						protocol: "TCP",
						hostPort: 80
					},
					{
						name: "https",
						containerPort: 443,
						protocol: "TCP",
						hostPort: 443
					}
				]
			};


			const spec = {
				metadata,
				spec: {
					containers: [container],
					nodeName: node.hostname
				}
			};

			// Create Pod
			const pod = await ctx.call("v1.kubernetes.createNamespacedPod", {
				cluster: router.cluster,
				namespace: metadata.namespace,
				body: spec
			});

			return this.updateEntity(ctx, {
				id: router.id,
				pod: pod.metadata.uid,
				status: "created"
			});
		},

		/**
		 * Delete router pod
		 * 
		 * @param {Object} ctx - moleculer context
		 * @param {Object} router - router object
		 * 
		 * @returns {Object} router object
		 */
		async deleteRouterPod(ctx, router) {

			const pod = await ctx.call("v1.kubernetes.readNamespacedPod", {
				cluster: router.cluster,
				namespace: this.config.get("routes.routers.namespace"),
				name: router.name
			});
			if (!pod) {
				throw new MoleculerClientError(
					`Pod ${router.name} not found`,
					404, "POD_NOT_FOUND", { id: router.name }
				);
			}

			await ctx.call("v1.kubernetes.deleteNamespacedPod", {
				cluster: router.cluster,
				namespace: this.config.get("routes.routers.namespace"),
				name: router.name
			});

			return this.updateEntity(ctx, {
				id: router.id,
				pod: null,
				status: "deleted"
			});
		},
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
