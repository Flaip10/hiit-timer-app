#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");

const args = process.argv.slice(2);
const HARD = args.includes("--hard");

const run = (cmd) => {
    console.log(`\n🔸 ${cmd}`);
    execSync(cmd, { stdio: "inherit" });
};

const rm = (target) => {
    if (fs.existsSync(target)) {
        console.log(`🔹 Removing ${target}`);
        execSync(`rm -rf "${target}"`);
    }
};

console.log("==========================================");
console.log("        🧹 React Native Cleaner (npm)");
console.log("==========================================");

// 1. Node modules
rm("node_modules");

// 2. JS + bundler caches
rm(".expo");
rm(".expo-shared");
rm(".expo-internal");
rm(".parcel-cache");
rm(".bundler");

// 3. iOS cleanup
if (fs.existsSync("ios")) {
    rm("ios/Pods");
    rm("ios/Podfile.lock");
    rm("ios/build");
    rm("ios/DerivedData");
}

// 4. Android cleanup
if (fs.existsSync("android")) {
    rm("android/.gradle");
    rm("android/.idea");
    rm("android/build");
    rm("android/app/build");
    if (HARD) rm("android/gradle");
}

// 5. Reinstall JS deps
run("npm install");

// 6. Re-run Expo prebuild
run("npx expo prebuild --clean");

// 7. Install iOS Pods
if (fs.existsSync("ios")) {
    run("cd ios && pod install");
}

console.log("\n==========================================");
console.log("      ✅ Cleaning Complete (npm)");
console.log("You can now run:");
console.log("   npm run ios");
console.log("   npm run android");
console.log("==========================================\n");