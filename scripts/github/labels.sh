#!/bin/bash

set -e

# Type labels
gh label create "type: bug" --color "d73a4a" --description "Broken or incorrect behavior." --force
gh label create "type: feature" --color "0e8a16" --description "New user-facing capability." --force
gh label create "type: enhancement" --color "1d76db" --description "Improvement to existing behavior." --force
gh label create "type: refactor" --color "5319e7" --description "Internal code cleanup without behavior changes." --force
gh label create "type: tech-debt" --color "b60205" --description "Known engineering debt or cleanup needed later." --force
gh label create "type: research" --color "fbca04" --description "Technical investigation before implementation." --force
gh label create "type: docs" --color "0052cc" --description "Documentation, release notes or project notes." --force

# Priority labels
gh label create "priority: p0" --color "b60205" --description "Critical issue blocking release or core usage." --force
gh label create "priority: p1" --color "d93f0b" --description "Important issue that should be handled soon." --force
gh label create "priority: p2" --color "fbca04" --description "Normal backlog work." --force
gh label create "priority: p3" --color "0e8a16" --description "Nice-to-have improvement." --force

# Platform labels
gh label create "platform: ios" --color "000000" --description "iOS-specific work." --force
gh label create "platform: android" --color "3ddc84" --description "Android-specific work." --force
gh label create "platform: cross-platform" --color "1d76db" --description "Applies to both iOS and Android." --force
gh label create "platform: app-store" --color "5319e7" --description "Apple App Store or TestFlight related work." --force
gh label create "platform: play-store" --color "3ddc84" --description "Google Play Console or Android release related work." --force

# Status labels
gh label create "status: blocked" --color "b60205" --description "Cannot continue until something else is resolved." --force
gh label create "status: needs-testing" --color "fbca04" --description "Needs validation before it can be considered done." --force
gh label create "status: needs-reproduction" --color "d876e3" --description "Reported issue that still needs reliable reproduction." --force
