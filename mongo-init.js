// Create admin user
dbAdmin = db.getSiblingDB("admin");
dbAdmin.createUser({
  user: "usernamesample",
  pwd: "passwordsample",
  roles: [{ role: "userAdminAnyDatabase", db: "admin" }],
  mechanisms: ["SCRAM-SHA-1"],
});

// Authenticate user
dbAdmin.auth({
  user: "usernamesample",
  pwd: "passwordsample",
  mechanisms: ["SCRAM-SHA-1"],
  digestPassword: true,
});

// Create user
db = db.getSiblingDB("queuenamesample");
db.createUser({
  user: "usernamesample",
  pwd: "passwordsample",
  roles: [{ role: "userAdmin", db: "queuenamesample" }],
  mechanisms: ["SCRAM-SHA-1"],
});

// Create DB and collection
db = new Mongo().getDB("queuenamesample");
// db.createCollection("customer_transaction", { capped: false });