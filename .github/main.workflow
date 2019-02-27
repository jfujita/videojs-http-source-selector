workflow "New workflow" {
  on = "push"
  resolves = ["npm publish"]
}

action "On Master branch" {
  uses = "actions/bin/filter@24a566c2524e05ebedadef0a285f72dc9b631411"
  args = "branch master"
}

action "Tagged commits" {
  uses = "actions/bin/filter@24a566c2524e05ebedadef0a285f72dc9b631411"
  needs = ["On Master branch"]
  args = "tag v*"
}

action "npm install" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["Tagged commits"]
  args = "install"
}

action "npm build" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["npm install"]
  args = "build"
}

action "npm publish" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["npm build"]
  args = "publish --access public"
  secrets = ["NPM_AUTH_TOKEN"]
}
