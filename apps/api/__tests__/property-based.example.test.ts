/**
 * Property-Based Testing Examples
 *
 * Property-based testing generates thousands of random inputs to test properties
 * of your code. It finds edge cases that manual tests miss.
 *
 * Note: fast-check is optional in constrained environments. When it is not
 * available, this example test suite is skipped to keep installs unblocked.
 *
 * Learn more: https://github.com/dubzzz/fast-check
 */

const fastCheck = (global as typeof global & { fc?: any }).fc;
const describeIfFastCheck = fastCheck ? describe : describe.skip;

describeIfFastCheck("Property-Based Testing Examples", () => {
  it("property: array sort maintains length", () => {
    fastCheck.assert(
      fastCheck.property(fastCheck.array(fastCheck.integer()), (arr) => {
        const sorted = [...arr].sort((a, b) => a - b);
        return sorted.length === arr.length;
      }),
    );
  });

  it("property: string reverse is involutive", () => {
    fastCheck.assert(
      fastCheck.property(fastCheck.string(), (str) => {
        const reversed = str.split("").reverse().join("");
        const doubleReversed = reversed.split("").reverse().join("");
        return doubleReversed === str;
      }),
    );
  });
});
