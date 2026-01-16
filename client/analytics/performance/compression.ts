/**
 * Payload Compression
 *
 * Compresses analytics payloads before sending to reduce bandwidth.
 * Supports gzip compression (standard in browsers/React Native).
 *
 * World-class standard: Segment achieves ~70% size reduction
 */

import { BatchPayload } from "../types";
import pako from "pako";

export interface CompressionResult {
  compressed: Uint8Array;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

export class PayloadCompressor {
  /**
   * Compress batch payload using gzip
   */
  compress(payload: BatchPayload): CompressionResult {
    const jsonString = JSON.stringify(payload);
    const originalSize = new Blob([jsonString]).size;

    // Compress using pako (gzip)
    const compressed = pako.gzip(jsonString);
    const compressedSize = compressed.length;

    const compressionRatio = (1 - compressedSize / originalSize) * 100;

    if (__DEV__) {
      console.log(
        `[Compression] Original: ${originalSize} bytes, Compressed: ${compressedSize} bytes, Ratio: ${compressionRatio.toFixed(1)}%`,
      );
    }

    return {
      compressed,
      originalSize,
      compressedSize,
      compressionRatio,
    };
  }

  /**
   * Check if compression is beneficial
   *
   * Small payloads may not benefit from compression overhead
   */
  shouldCompress(payload: BatchPayload): boolean {
    const jsonString = JSON.stringify(payload);
    const size = new Blob([jsonString]).size;

    // Only compress if payload is larger than 1KB
    return size > 1024;
  }

  /**
   * Compress payload if beneficial, otherwise return original
   */
  compressIfBeneficial(payload: BatchPayload): {
    data: Uint8Array | string;
    isCompressed: boolean;
    originalSize: number;
    finalSize: number;
  } {
    if (!this.shouldCompress(payload)) {
      const jsonString = JSON.stringify(payload);
      const size = new Blob([jsonString]).size;
      return {
        data: jsonString,
        isCompressed: false,
        originalSize: size,
        finalSize: size,
      };
    }

    const result = this.compress(payload);
    return {
      data: result.compressed,
      isCompressed: true,
      originalSize: result.originalSize,
      finalSize: result.compressedSize,
    };
  }
}

/**
 * Note: This requires adding 'pako' package for gzip compression
 *
 * Installation: npm install pako @types/pako
 *
 * Usage in transport.ts:
 *
 * const compressor = new PayloadCompressor();
 * const { data, isCompressed } = compressor.compressIfBeneficial(payload);
 *
 * const headers = {
 *   'Content-Type': 'application/json',
 *   ...(isCompressed && { 'Content-Encoding': 'gzip' })
 * };
 *
 * await fetch(endpoint, {
 *   method: 'POST',
 *   headers,
 *   body: isCompressed ? data : JSON.stringify(data)
 * });
 */
