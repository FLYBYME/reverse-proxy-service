[![Moleculer](https://badgen.net/badge/Powered%20by/Moleculer/0e83cd)](https://moleculer.services)

# Routes services

## Routes Service

The `routes` service is responsible for managing route configurations. It provides the following features:
- CRUD operations for routes.
- Lookup routes by `vHost`.
- Supports various routing strategies like `RandomStrategy`, `IPHashStrategy`, `LatencyStrategy`, and `RoundRobinStrategy`.

### Actions

- `lookup`: Lookup a route by `vHost`.
  - **Example**: 
    ```js
    const route = await broker.call("routes.lookup", { vHost: "example.com" });
    ```

### Fields

- `vHost`: The virtual host name.
  - **Example**: `"example.com"`
- `zone`: The zone of the route.
  - **Example**: `"us-east-1"`
- `certs`: Indicates if certificates are required.
  - **Example**: `true`
- `auth`: Authentication method.
  - **Example**: `"basic"`
- `strategy`: Routing strategy.
  - **Example**: `"RoundRobinStrategy"`
- `id`: Primary key.
  - **Example**: `1`
- `createdAt`: Timestamp when the route was created.
  - **Example**: `"2021-01-01T00:00:00Z"`
- `updatedAt`: Timestamp when the route was last updated.
  - **Example**: `"2021-01-02T00:00:00Z"`
- `deletedAt`: Timestamp when the route was deleted.
  - **Example**: `"2021-01-03T00:00:00Z"`

## Routes Hosts Service

The `routes.hosts` service manages the hosts associated with routes. It provides the following features:
- CRUD operations for route hosts.
- Lookup hosts by route.
- Automatically removes hosts when a route is deleted.

### Actions

- `lookup`: Lookup hosts by route.
  - **Example**: 
    ```js
    const hosts = await broker.call("routes.hosts.lookup", { route: 1 });
    ```

### Fields

- `route`: The associated route ID.
  - **Example**: `1`
- `hostname`: The hostname of the host.
  - **Example**: `"host1.example.com"`
- `port`: The port number.
  - **Example**: `80`
- `weight`: The weight of the host.
  - **Example**: `10`
- `vnodes`: The number of virtual nodes.
  - **Example**: `100`
- `group`: The group of the host (e.g., `BLUE`, `GREEN`).
  - **Example**: `"BLUE"`
- `protocol`: The protocol used by the host (e.g., `http:`, `https:`).
  - **Example**: `"http:"`
- `cluster`: The cluster name.
  - **Example**: `"cluster1"`
- `id`: Primary key.
  - **Example**: `1`
- `createdAt`: Timestamp when the host was created.
  - **Example**: `"2021-01-01T00:00:00Z"`
- `updatedAt`: Timestamp when the host was last updated.
  - **Example**: `"2021-01-02T00:00:00Z"`
- `deletedAt`: Timestamp when the host was deleted.
  - **Example**: `"2021-01-03T00:00:00Z"`

## Routes Proxy Service

The `routes.proxy` service is responsible for proxying HTTP and HTTPS requests to the appropriate backend hosts based on the configured routes. It provides the following features:
- Create, add, and remove routes and hosts.
- Mark hosts as dead.
- Resolve routes.
- Retrieve statistics and information about routes.
- Sync routes with the database.
- Enable or disable logging.

### Actions

- `createRoute`: Create a new route.
  - **Example**: 
    ```js
    const route = await broker.call("routes.proxy.createRoute", { vHost: "example.com", zone: "us-east-1" });
    ```
- `addHost`: Add a host to a route.
  - **Example**: 
    ```js
    const host = await broker.call("routes.proxy.addHost", { route: 1, hostname: "host1.example.com", port: 80 });
    ```
- `removeHost`: Remove a host from a route.
  - **Example**: 
    ```js
    await broker.call("routes.proxy.removeHost", { route: 1, hostname: "host1.example.com" });
    ```
- `markHostDead`: Mark a host as dead.
  - **Example**: 
    ```js
    await broker.call("routes.proxy.markHostDead", { route: 1, hostname: "host1.example.com" });
    ```
- `resolve`: Resolve a route by size.
  - **Example**: 
    ```js
    const resolvedRoute = await broker.call("routes.proxy.resolve", { size: 100 });
    ```
- `stats`: Retrieve statistics for a route.
  - **Example**: 
    ```js
    const stats = await broker.call("routes.proxy.stats", { route: 1 });
    ```
- `info`: Retrieve information about routes.
  - **Example**: 
    ```js
    const info = await broker.call("routes.proxy.info", { route: 1 });
    ```
- `sync`: Sync routes with the database.
  - **Example**: 
    ```js
    await broker.call("routes.proxy.sync");
    ```
- `syncRoute`: Sync a specific route.
  - **Example**: 
    ```js
    await broker.call("routes.proxy.syncRoute", { route: 1 });
    ```
- `logging`: Enable or disable logging.
  - **Example**: 
    ```js
    await broker.call("routes.proxy.logging", { enable: true });
    ```

### Fields

- `clusterName`: The name of the cluster.
  - **Example**: `"cluster1"`
- `logger`: The logger instance.
  - **Example**: `console`
- `httpKeepAlive`: Whether to keep HTTP connections alive.
  - **Example**: `true`
- `maxSockets`: The maximum number of sockets.
  - **Example**: `100`
- `port`: The HTTP port.
  - **Example**: `80`
- `https`: The HTTPS configuration.
  - **Example**: `{ key: "key.pem", cert: "cert.pem" }`
- `tcpTimeout`: The TCP timeout.
  - **Example**: `30000`
- `retryOnError`: The number of retries on error.
  - **Example**: `3`
- `errorPage`: The error page content.
  - **Example**: `"Error occurred"`

