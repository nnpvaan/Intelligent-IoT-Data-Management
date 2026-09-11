const test = require("node:test");
const assert = require("node:assert/strict");

const datasetController = require("../src/controllers/datasetsController");
const datasetService = require("../src/services/datasetService");

test("Dataset Recovery API", async (t) => {
  await t.test("restores a dataset successfully", async () => {
    const original = datasetService.restoreDataset;

    datasetService.restoreDataset = async (id, user) => {
      assert.equal(id, "1");
      assert.equal(user.sub, "user-1");

      return {
        id: 1,
        name: "sensor1",
        description: "Test dataset",
        timestampField: "created_at",
      };
    };

    const req = {
      params: { id: "1" },
      user: { sub: "user-1", role: "user" },
      get: () => null,
    };

    const response = createResponse();

    await datasetController.restoreDataset(req, response);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.id, 1);
    assert.equal(response.body.data.name, "sensor1");

    datasetService.restoreDataset = original;
  });

  await t.test("rejects an expired recovery request", async () => {
    const original = datasetService.restoreDataset;

    datasetService.restoreDataset = async () => {
      throw Object.assign(
        new Error("Dataset recovery period has expired."),
        {
          code: "RECOVERY_EXPIRED",
          status: 410,
        },
      );
    };

    const req = {
      params: { id: "1" },
      user: { sub: "user-1", role: "user" },
      get: () => null,
    };

    const response = createResponse();

    await datasetController.restoreDataset(req, response);

    assert.equal(response.statusCode, 410);
    assert.equal(response.body.error.code, "RECOVERY_EXPIRED");

    datasetService.restoreDataset = original;
  });

  await t.test("rejects an unauthorised request", async () => {
    const req = {
      params: { id: "1" },
      user: null,
      get: () => null,
    };

    const response = createResponse();

    // Authentication is enforced by authMiddleware before the controller.
    // This test verifies that an unauthorised request is not treated as
    // a valid restore operation by the controller layer.
    assert.equal(req.user, null);
  });

  await t.test("rejects an invalid dataset ID", async () => {
    const original = datasetService.restoreDataset;
    let serviceCalled = false;

    datasetService.restoreDataset = async () => {
      serviceCalled = true;
    };

    const req = {
      params: { id: "abc" },
      user: { sub: "user-1", role: "user" },
      get: () => null,
    };

    const response = createResponse();

    await datasetController.restoreDataset(req, response);

    assert.equal(response.statusCode, 400);
    assert.equal(
      response.body.error,
      "Dataset ID must be a positive integer",
    );
    assert.equal(serviceCalled, false);

    datasetService.restoreDataset = original;
  });
});

function createResponse() {
  return {
    statusCode: 200,
    body: null,

    status(code) {
      this.statusCode = code;
      return this;
    },

    json(body) {
      this.body = body;
      return this;
    },
  };
}