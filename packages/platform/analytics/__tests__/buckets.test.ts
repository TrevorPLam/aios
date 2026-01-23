/**
 * Bucket Helpers Tests
 *
 * Tests for bucketing functions to ensure correct categorization
 */

import {
  getTextLengthBucket,
  getDurationBucket,
  getLatencyBucket,
  getAmountBucket,
  getQueryLengthBucket,
  getResultsCountBucket,
  getInstallAgeBucket,
} from "../sanitizer";

describe("Bucket Helpers", () => {
  describe("getTextLengthBucket", () => {
    it("should bucket text lengths correctly", () => {
      expect(getTextLengthBucket(0)).toBe("0-20");
      expect(getTextLengthBucket(10)).toBe("0-20");
      expect(getTextLengthBucket(20)).toBe("0-20");
      expect(getTextLengthBucket(21)).toBe("21-80");
      expect(getTextLengthBucket(50)).toBe("21-80");
      expect(getTextLengthBucket(80)).toBe("21-80");
      expect(getTextLengthBucket(81)).toBe("81-200");
      expect(getTextLengthBucket(150)).toBe("81-200");
      expect(getTextLengthBucket(200)).toBe("81-200");
      expect(getTextLengthBucket(201)).toBe("201-500");
      expect(getTextLengthBucket(350)).toBe("201-500");
      expect(getTextLengthBucket(500)).toBe("201-500");
      expect(getTextLengthBucket(501)).toBe("501+");
      expect(getTextLengthBucket(1000)).toBe("501+");
    });
  });

  describe("getDurationBucket", () => {
    it("should bucket durations correctly", () => {
      expect(getDurationBucket(0)).toBe("<5s");
      expect(getDurationBucket(4)).toBe("<5s");
      expect(getDurationBucket(5)).toBe("5-30s");
      expect(getDurationBucket(15)).toBe("5-30s");
      expect(getDurationBucket(29)).toBe("5-30s");
      expect(getDurationBucket(30)).toBe("30-120s");
      expect(getDurationBucket(60)).toBe("30-120s");
      expect(getDurationBucket(119)).toBe("30-120s");
      expect(getDurationBucket(120)).toBe("2-10m");
      expect(getDurationBucket(300)).toBe("2-10m");
      expect(getDurationBucket(599)).toBe("2-10m");
      expect(getDurationBucket(600)).toBe("10m+");
      expect(getDurationBucket(1000)).toBe("10m+");
    });
  });

  describe("getLatencyBucket", () => {
    it("should bucket latencies correctly", () => {
      expect(getLatencyBucket(0)).toBe("<100ms");
      expect(getLatencyBucket(50)).toBe("<100ms");
      expect(getLatencyBucket(99)).toBe("<100ms");
      expect(getLatencyBucket(100)).toBe("100-300ms");
      expect(getLatencyBucket(200)).toBe("100-300ms");
      expect(getLatencyBucket(299)).toBe("100-300ms");
      expect(getLatencyBucket(300)).toBe("300ms-1s");
      expect(getLatencyBucket(500)).toBe("300ms-1s");
      expect(getLatencyBucket(999)).toBe("300ms-1s");
      expect(getLatencyBucket(1000)).toBe("1-3s");
      expect(getLatencyBucket(2000)).toBe("1-3s");
      expect(getLatencyBucket(2999)).toBe("1-3s");
      expect(getLatencyBucket(3000)).toBe("3s+");
      expect(getLatencyBucket(5000)).toBe("3s+");
    });
  });

  describe("getAmountBucket", () => {
    it("should bucket amounts correctly", () => {
      expect(getAmountBucket(0)).toBe("0-20");
      expect(getAmountBucket(10)).toBe("0-20");
      expect(getAmountBucket(20)).toBe("0-20");
      expect(getAmountBucket(21)).toBe("21-100");
      expect(getAmountBucket(50)).toBe("21-100");
      expect(getAmountBucket(100)).toBe("21-100");
      expect(getAmountBucket(101)).toBe("101-500");
      expect(getAmountBucket(300)).toBe("101-500");
      expect(getAmountBucket(500)).toBe("101-500");
      expect(getAmountBucket(501)).toBe("501-2000");
      expect(getAmountBucket(1000)).toBe("501-2000");
      expect(getAmountBucket(2000)).toBe("501-2000");
      expect(getAmountBucket(2001)).toBe("2000+");
      expect(getAmountBucket(5000)).toBe("2000+");
    });
  });

  describe("getQueryLengthBucket", () => {
    it("should bucket query lengths correctly", () => {
      expect(getQueryLengthBucket(0)).toBe("0");
      expect(getQueryLengthBucket(1)).toBe("1-3");
      expect(getQueryLengthBucket(2)).toBe("1-3");
      expect(getQueryLengthBucket(3)).toBe("1-3");
      expect(getQueryLengthBucket(4)).toBe("4-10");
      expect(getQueryLengthBucket(7)).toBe("4-10");
      expect(getQueryLengthBucket(10)).toBe("4-10");
      expect(getQueryLengthBucket(11)).toBe("11-25");
      expect(getQueryLengthBucket(20)).toBe("11-25");
      expect(getQueryLengthBucket(25)).toBe("11-25");
      expect(getQueryLengthBucket(26)).toBe("26+");
      expect(getQueryLengthBucket(100)).toBe("26+");
    });
  });

  describe("getResultsCountBucket", () => {
    it("should bucket results counts correctly", () => {
      expect(getResultsCountBucket(0)).toBe("0");
      expect(getResultsCountBucket(1)).toBe("1-3");
      expect(getResultsCountBucket(2)).toBe("1-3");
      expect(getResultsCountBucket(3)).toBe("1-3");
      expect(getResultsCountBucket(4)).toBe("4-10");
      expect(getResultsCountBucket(7)).toBe("4-10");
      expect(getResultsCountBucket(10)).toBe("4-10");
      expect(getResultsCountBucket(11)).toBe("11-25");
      expect(getResultsCountBucket(20)).toBe("11-25");
      expect(getResultsCountBucket(25)).toBe("11-25");
      expect(getResultsCountBucket(26)).toBe("26+");
      expect(getResultsCountBucket(100)).toBe("26+");
    });
  });

  describe("getInstallAgeBucket", () => {
    it("should bucket install ages correctly", () => {
      expect(getInstallAgeBucket(0)).toBe("0d");
      expect(getInstallAgeBucket(1)).toBe("1-7d");
      expect(getInstallAgeBucket(4)).toBe("1-7d");
      expect(getInstallAgeBucket(7)).toBe("1-7d");
      expect(getInstallAgeBucket(8)).toBe("8-30d");
      expect(getInstallAgeBucket(15)).toBe("8-30d");
      expect(getInstallAgeBucket(30)).toBe("8-30d");
      expect(getInstallAgeBucket(31)).toBe("31-90d");
      expect(getInstallAgeBucket(60)).toBe("31-90d");
      expect(getInstallAgeBucket(90)).toBe("31-90d");
      expect(getInstallAgeBucket(91)).toBe("90d+");
      expect(getInstallAgeBucket(365)).toBe("90d+");
    });
  });
});
