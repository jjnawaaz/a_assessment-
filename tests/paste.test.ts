import "dotenv/config.js";

import { afterAll, describe, expect, it } from "vitest";
import request from "supertest";

import app from "../src/app.js";
import prisma from "../src/lib/prisma.js";

const createdPasteIds = new Set<string>();

const createTestPaste = async (payload: Record<string, unknown>) => {
  const response = await request(app).post("/api/pastes").send(payload);

  if (response.body.id) {
    createdPasteIds.add(response.body.id);
  }

  return response;
};

afterAll(async () => {
  try {
    if (createdPasteIds.size > 0) {
      await prisma.paste.deleteMany({
        where: {
          id: {
            in: [...createdPasteIds],
          },
        },
      });
    }
  } finally {
    await prisma.$disconnect();
  }
});

describe("Paste API Integration Tests", () => {
  describe("POST /api/pastes", () => {
    it("should create a paste successfully", async () => {
      const response = await createTestPaste({
        content: "Hello Aganitha",
      });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.url).toContain("/p/");
      expect(response.body.maxViews).toBeNull();
      expect(response.body.expiresAt).toBeNull();
    });

    it("should create a paste with maxViews", async () => {
      const response = await createTestPaste({
        content: "Limited views",
        maxViews: 3,
      });

      expect(response.status).toBe(201);
      expect(response.body.maxViews).toBe(3);
    });

    it("should create a paste with time expiration", async () => {
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      const response = await createTestPaste({
        content: "Time limited paste",
        expiresAt,
      });

      expect(response.status).toBe(201);
      expect(response.body.expiresAt).toBe(new Date(expiresAt).toISOString());
    });

    it("should reject empty content", async () => {
      const response = await request(app).post("/api/pastes").send({
        content: "",
      });

      expect(response.status).toBe(400);
    });

    it("should reject invalid maxViews", async () => {
      const response = await request(app).post("/api/pastes").send({
        content: "Invalid views",
        maxViews: 0,
      });

      expect(response.status).toBe(400);
    });

    it("should reject invalid expiration dates", async () => {
      const response = await request(app).post("/api/pastes").send({
        content: "Invalid expiration",
        expiresAt: "invalid-date",
      });

      expect(response.status).toBe(400);
    });

    it("should reject past expiration dates", async () => {
      const response = await request(app)
        .post("/api/pastes")
        .send({
          content: "Already expired",
          expiresAt: new Date(Date.now() - 60 * 1000).toISOString(),
        });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/pastes/:id", () => {
    it("should retrieve an existing paste", async () => {
      const created = await createTestPaste({
        content: "Retrieve this paste",
      });

      const response = await request(app).get(`/api/pastes/${created.body.id}`);

      expect(response.status).toBe(200);
      expect(response.body.content).toBe("Retrieve this paste");
      expect(response.body.viewCount).toBe(1);
    });

    it("should return 404 for a nonexistent paste", async () => {
      const response = await request(app).get("/api/pastes/nonexistent123");

      expect(response.status).toBe(404);
    });

    it("should preserve multiline and special character content", async () => {
      const content = "Line 1\nLine 2\n<script>alert('test')</script>";

      const created = await createTestPaste({
        content,
      });

      const response = await request(app).get(`/api/pastes/${created.body.id}`);

      expect(response.status).toBe(200);
      expect(response.body.content).toBe(content);
    });
  });

  describe("View-based expiration", () => {
    it("should expire a paste after reaching maxViews", async () => {
      const created = await createTestPaste({
        content: "Two views only",
        maxViews: 2,
      });

      const firstView = await request(app).get(
        `/api/pastes/${created.body.id}`,
      );

      const secondView = await request(app).get(
        `/api/pastes/${created.body.id}`,
      );

      const thirdView = await request(app).get(
        `/api/pastes/${created.body.id}`,
      );

      expect(firstView.status).toBe(200);
      expect(secondView.status).toBe(200);
      expect(secondView.body.viewCount).toBe(2);
      expect(thirdView.status).toBe(404);
    });

    it("should allow only one request when one view remains", async () => {
      const created = await createTestPaste({
        content: "Concurrent access test",
        maxViews: 1,
      });

      const requests = Array.from({ length: 10 }, () =>
        request(app).get(`/api/pastes/${created.body.id}`),
      );

      const responses = await Promise.all(requests);

      const successfulRequests = responses.filter(
        (response) => response.status === 200,
      );

      const rejectedRequests = responses.filter(
        (response) => response.status === 404,
      );

      expect(successfulRequests).toHaveLength(1);
      expect(rejectedRequests).toHaveLength(9);
    });
  });

  describe("Time-based expiration", () => {
    it("should reject a paste after expiration", async () => {
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      const created = await createTestPaste({
        content: "Will expire",
        expiresAt: expiresAt.toISOString(),
      });

      // Move expiration into the past directly in the database.
      await prisma.paste.update({
        where: {
          id: created.body.id,
        },
        data: {
          expiresAt: new Date(Date.now() - 1000),
        },
      });

      const response = await request(app).get(`/api/pastes/${created.body.id}`);

      expect(response.status).toBe(404);
    });
  });

  describe("Shareable paste page", () => {
    it("should render paste content as HTML", async () => {
      const created = await createTestPaste({
        content: "Hello from the browser",
      });

      const response = await request(app).get(`/p/${created.body.id}`);

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("text/html");
      expect(response.text).toContain("Hello from the browser");
    });

    it("should escape HTML to prevent script execution", async () => {
      const created = await createTestPaste({
        content: "<script>alert('xss')</script>",
      });

      const response = await request(app).get(`/p/${created.body.id}`);

      expect(response.status).toBe(200);
      expect(response.text).toContain("&lt;script&gt;");
      expect(response.text).not.toContain("<script>alert('xss')</script>");
    });
  });
});
