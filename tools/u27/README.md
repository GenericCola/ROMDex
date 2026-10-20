# U27 isolated checks

Run from the repository root with a Node runtime supporting node:sqlite. Create work/u27/tmp and set ROMDEX_TEST_SCRATCH, TEMP and TMP to its absolute path. Run node tools/u27/service-smoke.mjs. This fixture forbids external fetches.

For node tools/u27/ui-check.mjs, install Playwright externally or set PLAYWRIGHT_MODULE_PATH to its absolute module path. Set CHROME_PATH if Chrome is elsewhere. The script hosts source assets on loopback and aborts all non-loopback browser requests; it uses synthetic data and in-memory task transport. Outputs go to work/u27. No production Data or token is needed.

Model tests are in apps/romdex/tests: human-testing, human-testing-metadata, testing-completion and testing-native-status. Run them with node --test and the same scratch environment. Historical evidence was generated from equivalent scripts in the original source layout; these archived copies use repository paths.
