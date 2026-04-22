'use strict';

const build = require('@microsoft/sp-build-web');

build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);

// Disable live reload
build.configureWebpack.mergeConfig({
  additionalConfiguration: (generatedConfiguration) => {
    if (generatedConfiguration.devServer) {
      generatedConfiguration.devServer.liveReload = false;
      generatedConfiguration.devServer.hot = false;
    }
    return generatedConfiguration;
  }
});

var getTasks = build.rig.getTasks;
build.rig.getTasks = function () {
  var result = getTasks.call(build.rig);

  result.set('serve', result.get('serve-deprecated'));

  return result;
};

build.initialize(require('gulp'));

