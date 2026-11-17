#!/usr/bin/env bash
# Applies the repository settings that live outside the code: merge method, security features,
# workflow permissions and the branch ruleset. Idempotent: run it after creating the repository
# and again after changing .github/rulesets/main.json. Needs the GitHub CLI, signed in with admin rights.
set -euo pipefail

repo="${1:?usage: .github/settings.sh <owner>/<repo>}"
here="$(cd "$(dirname "$0")" && pwd)"

# only rebase merging, so every commit lands on main as written; merged branches are deleted
gh repo edit "$repo" \
  --enable-rebase-merge \
  --enable-squash-merge=false \
  --enable-merge-commit=false \
  --enable-auto-merge=false \
  --delete-branch-on-merge

# secret scanning with push protection, Dependabot alerts and fixes, private vulnerability reports
gh api -X PATCH "repos/$repo" \
  -f "security_and_analysis[secret_scanning][status]=enabled" \
  -f "security_and_analysis[secret_scanning_push_protection][status]=enabled" > /dev/null
gh api -X PUT "repos/$repo/vulnerability-alerts" > /dev/null
gh api -X PUT "repos/$repo/automated-security-fixes" > /dev/null
gh api -X PUT "repos/$repo/private-vulnerability-reporting" > /dev/null

# workflows get a read-only token unless a job asks for more
gh api -X PUT "repos/$repo/actions/permissions/workflow" \
  -f default_workflow_permissions=read \
  -F can_approve_pull_request_reviews=false > /dev/null

# the branch ruleset: create it, or update it when it already exists
id="$(gh api "repos/$repo/rulesets" --jq '.[] | select(.name == "main") | .id')"
if [ -n "$id" ]; then
  gh api -X PUT "repos/$repo/rulesets/$id" --input "$here/rulesets/main.json" > /dev/null
else
  gh api -X POST "repos/$repo/rulesets" --input "$here/rulesets/main.json" > /dev/null
fi
echo "Settings applied to $repo"
