#!/bin/bash

set -e

# Type labels
gh label create ".bug" --color "d73a4a" --description "Broken or incorrect behavior." --force
gh label create ".feature" --color "2da44e" --description "New user-facing capability." --force
gh label create ".enhancement" --color "0969da" --description "Improvement to existing behavior." --force
gh label create ".refactor" --color "8250df" --description "Internal code cleanup without behavior changes." --force
gh label create ".tech-debt" --color "bf8700" --description "Known engineering debt or cleanup needed later." --force
gh label create ".research" --color "fbca04" --description "Technical investigation before implementation." --force
gh label create ".docs" --color "57606a" --description "Documentation, release notes or project notes." --force

# Priority labels
gh label create "priority: p0" --color "fef2c0" --description "Critical issue blocking release or core usage." --force
gh label create "priority: p1" --color "fef2c0" --description "Important issue that should be handled soon." --force
gh label create "priority: p2" --color "fef2c0" --description "Normal backlog work." --force
gh label create "priority: p3" --color "fef2c0" --description "Nice-to-have improvement." --force

# Platform labels
gh label create "platform: ios" --color "0a84ff" --description "iOS-specific work." --force
gh label create "platform: android" --color "3ddc84" --description "Android-specific work." --force
gh label create "platform: cross-platform" --color "1d76db" --description "Applies to both iOS and Android." --force
gh label create "platform: app-store" --color "5319e7" --description "Apple App Store or TestFlight related work." --force
gh label create "platform: play-store" --color "34a853" --description "Google Play Console or Android release related work." --force

# Status labels
gh label create "status: blocked" --color "d4c5f9" --description "Cannot continue until something else is resolved." --force
gh label create "status: needs-testing" --color "d4c5f9" --description "Needs validation before it can be considered done." --force
gh label create "status: needs-reproduction" --color "d4c5f9" --description "Reported issue that still needs reliable reproduction." --force
