/**
 * Tests for useDataLoader hook
 */

import { renderHook, waitFor } from "@testing-library/react-native";
import { useDataLoader } from "../useDataLoader";

describe("useDataLoader", () => {
  it("should start with loading state when immediate is true", () => {
    const mockLoader = jest.fn().mockResolvedValue("test data");
    
    const { result } = renderHook(() => useDataLoader(mockLoader));
    
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should load data successfully", async () => {
    const mockData = { id: "1", name: "Test" };
    const mockLoader = jest.fn().mockResolvedValue(mockData);
    
    const { result } = renderHook(() => useDataLoader(mockLoader));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(mockLoader).toHaveBeenCalledTimes(1);
  });

  it("should handle errors", async () => {
    const mockError = new Error("Failed to load");
    const mockLoader = jest.fn().mockRejectedValue(mockError);
    
    const { result } = renderHook(() => useDataLoader(mockLoader));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual(mockError);
  });

  it("should support retry after error", async () => {
    const mockError = new Error("Failed to load");
    const mockData = { id: "1", name: "Test" };
    const mockLoader = jest
      .fn()
      .mockRejectedValueOnce(mockError)
      .mockResolvedValueOnce(mockData);
    
    const { result } = renderHook(() => useDataLoader(mockLoader));
    
    // Wait for initial error
    await waitFor(() => {
      expect(result.current.error).toEqual(mockError);
    });
    
    // Retry
    await result.current.retry();
    
    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });
    
    expect(result.current.error).toBeNull();
    expect(mockLoader).toHaveBeenCalledTimes(2);
  });

  it("should not load immediately when immediate is false", () => {
    const mockLoader = jest.fn().mockResolvedValue("test data");
    
    const { result } = renderHook(() =>
      useDataLoader(mockLoader, { immediate: false })
    );
    
    expect(result.current.loading).toBe(false);
    expect(mockLoader).not.toHaveBeenCalled();
  });

  it("should support manual reload", async () => {
    const mockData = { id: "1", name: "Test" };
    const mockLoader = jest.fn().mockResolvedValue(mockData);
    
    const { result } = renderHook(() => useDataLoader(mockLoader));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Reload
    await result.current.reload();
    
    expect(mockLoader).toHaveBeenCalledTimes(2);
  });
});
