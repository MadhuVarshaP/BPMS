jest.mock("../config/blockchain", () => ({
  getReadOnlyContract: jest.fn(),
  normalizeAddress: jest.fn((a) => String(a).toLowerCase()),
}));
jest.mock("../models/User", () => ({ findOne: jest.fn() }));
jest.mock("../services/userService", () => ({ ensureUserFromChain: jest.fn() }));

const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const { getReadOnlyContract } = require("../config/blockchain");
const User = require("../models/User");
const { ensureUserFromChain } = require("../services/userService");

const WALLET = "0xAbC0000000000000000000000000000000000001";

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function mockReq(overrides = {}) {
  return { headers: {}, body: {}, query: {}, ...overrides };
}

beforeEach(() => {
  jest.clearAllMocks();
  delete process.env.CHAIN_ROLE_ENFORCEMENT;
});

describe("requireAuth", () => {
  test("401 when no wallet address is supplied", async () => {
    const res = mockRes();
    const next = jest.fn();
    await requireAuth(mockReq(), res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("reads wallet address from x-wallet-address header and normalizes it", async () => {
    User.findOne.mockResolvedValue({ status: "active", role: "admin" });
    const req = mockReq({ headers: { "x-wallet-address": WALLET } });
    const next = jest.fn();
    await requireAuth(req, mockRes(), next);
    expect(next).toHaveBeenCalled();
    expect(req.auth.walletAddress).toBe(WALLET.toLowerCase());
    expect(req.auth.role).toBe("admin");
  });

  test("falls back to on-chain lookup when user is not in the DB", async () => {
    User.findOne.mockResolvedValue(null);
    ensureUserFromChain.mockResolvedValue({ status: "active", role: "device" });
    const req = mockReq({ body: { walletAddress: WALLET } });
    const next = jest.fn();
    await requireAuth(req, mockRes(), next);
    expect(ensureUserFromChain).toHaveBeenCalledWith(WALLET.toLowerCase());
    expect(next).toHaveBeenCalled();
  });

  test("403 when user exists but is not active", async () => {
    User.findOne.mockResolvedValue({ status: "suspended", role: "publisher" });
    const res = mockRes();
    const next = jest.fn();
    await requireAuth(mockReq({ query: { walletAddress: WALLET } }), res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("500 when the DB lookup throws", async () => {
    User.findOne.mockRejectedValue(new Error("db down"));
    const res = mockRes();
    await requireAuth(mockReq({ body: { walletAddress: WALLET } }), res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("requireRole", () => {
  test("401 when requireAuth has not run first", async () => {
    const res = mockRes();
    await requireRole("admin")(mockReq(), res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("403 when role is not in the allowed list", async () => {
    const res = mockRes();
    const req = mockReq();
    req.auth = { role: "device", walletAddress: WALLET.toLowerCase() };
    await requireRole(["admin", "publisher"])(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("admin passes without any on-chain check", async () => {
    const req = mockReq();
    req.auth = { role: "admin", walletAddress: WALLET.toLowerCase() };
    const next = jest.fn();
    await requireRole("admin")(req, mockRes(), next);
    expect(next).toHaveBeenCalled();
    expect(getReadOnlyContract).not.toHaveBeenCalled();
  });

  test("publisher passes when authorized on-chain", async () => {
    getReadOnlyContract.mockReturnValue({
      authorizedPublishers: jest.fn().mockResolvedValue(true),
    });
    const req = mockReq();
    req.auth = { role: "publisher", walletAddress: WALLET.toLowerCase() };
    const next = jest.fn();
    await requireRole("publisher")(req, mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  test("403 when publisher is not authorized on-chain", async () => {
    getReadOnlyContract.mockReturnValue({
      authorizedPublishers: jest.fn().mockResolvedValue(false),
    });
    const req = mockReq();
    req.auth = { role: "publisher", walletAddress: WALLET.toLowerCase() };
    const res = mockRes();
    await requireRole("publisher")(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("403 when device is not registered on-chain", async () => {
    getReadOnlyContract.mockReturnValue({
      registeredDevices: jest.fn().mockResolvedValue(false),
    });
    const req = mockReq();
    req.auth = { role: "device", walletAddress: WALLET.toLowerCase() };
    const res = mockRes();
    await requireRole("device")(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("falls back to DB role when RPC fails in non-strict mode", async () => {
    getReadOnlyContract.mockImplementation(() => {
      throw new Error("rpc unreachable");
    });
    const req = mockReq();
    req.auth = { role: "device", walletAddress: WALLET.toLowerCase() };
    const next = jest.fn();
    await requireRole("device")(req, mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  test("503 when RPC fails in strict mode", async () => {
    process.env.CHAIN_ROLE_ENFORCEMENT = "strict";
    getReadOnlyContract.mockImplementation(() => {
      throw new Error("rpc unreachable");
    });
    const req = mockReq();
    req.auth = { role: "publisher", walletAddress: WALLET.toLowerCase() };
    const res = mockRes();
    await requireRole("publisher")(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(503);
  });
});
