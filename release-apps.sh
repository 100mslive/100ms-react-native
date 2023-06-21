#!/bin/sh
#alias rel='sh -x release-apps.sh'

set -e
set -x

perform_npm_actions() {
  git pull --verbose

  npm install

  cd ./example

  npm install
}

release_android() {
  cd ./android

  bundle install --verbose

  bundle exec fastlane release_on_firebase
}

release_iOS() {
  cd ./ios

  pod install --verbose

  bundle install --verbose

  bundle exec fastlane distribute_app
}

perform_git_actions() {
  cd ..

  while read line; do
    if [[ $line =~ ^versionCode.[0-9]+$ ]]; then
      buildNumber=$(echo $line | grep -o -E '[0-9]+')
    elif [[ $line =~ ^versionName.*$ ]]; then
      versionCode=$(echo $line | grep -o -E '[0-9].[0-9].[0-9]+')
    fi
  done <example/android/app/build.gradle

  git add example/android/app/build.gradle
  git add example/ios/Podfile.lock
  git add example/ios/RNHMSExample/Info.plist
  git add example/ios/RNHMSExample.xcodeproj/project.pbxproj

  git commit -m "released sample app version $versionCode ($buildNumber) ⚛️" --no-verify

  git push --verbose
}

perform_npm_actions
P1=$!

wait $P1

release_android &
P2=$!

release_iOS &
P3=$!

wait $P2 $P3

perform_git_actions

say done
