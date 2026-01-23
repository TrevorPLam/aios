import { contextEngine, ContextZone } from "../contextEngine";
import { eventBus, EVENT_TYPES } from "../eventBus";

describe("contextEngine", () => {
  afterEach(() => {
    contextEngine.setUserOverride(null);
    eventBus.emit(EVENT_TYPES.USER_ACTION, {
      action: "attention:focus-mode-changed",
      mode: { enabled: false },
    });
  });

  it("should prioritize focus mode when enabled", () => {
    eventBus.emit(EVENT_TYPES.USER_ACTION, {
      action: "attention:focus-mode-changed",
      mode: { enabled: true },
    });

    const detection = contextEngine.detectContext();

    expect(detection.zone).toBe(ContextZone.FOCUS);
  });

  it("should include hidden modules using registry data", () => {
    contextEngine.setUserOverride(ContextZone.FOCUS);

    const detection = contextEngine.detectContext();

    expect(detection.hiddenModules).toContain("photos");
  });
});
