const typescript = require('broccoli-typescript-compiler');
const Rollup = require('broccoli-rollup');
const MergeTrees = require('broccoli-merge-trees');
const Funnel = require('broccoli-funnel');
const path = require('path');
const buble = require('rollup-plugin-buble');
const fs = require('fs');
const SOURCE_MAPPING_DATA_URL = '//# sourceMap' + 'pingURL=data:application/json;base64,';

module.exports = function () {
  const src = new MergeTrees([
    new Funnel(path.dirname(require.resolve('@types/qunit/package')), {
      destDir: 'qunit',
      include: ['index.d.ts']
    }),
    new Funnel(__dirname + '/src', {
      destDir: 'src'
    }),
    new Funnel(__dirname + '/tests', {
      destDir: 'tests'
    })
  ]);

  const compiled = typescript(src);

  const robotTurtle = new Rollup(compiled, {
    rollup: {
      input: 'src/index.js',
      plugins: [
        loadWithInlineMap()
      ],
      output: [{
        sourceMap: true,
        format: 'es',
        file: 'es6/robot-turtle.js'
      }]
    }
  });

  const amdNamed = new Rollup(compiled, {
    rollup: {
      input: 'src/index.js',
      plugins: [
        loadWithInlineMap(),
        buble()
      ],
      output: [{
        file: 'named-amd/robot-turtle.js',
        exports: 'named',
        format: 'amd',
        sourceMap: true,
        amd: 'robot-turtle'
      }, {
        file: 'robot-turtle.js',
        format: 'cjs'
      }]
    }
  });

  const amdTests = new Rollup(compiled, {
    annotation: 'named-amd/tests.js',
    rollup: {
      input: 'tests/index.js',
      external: ['robot-turtle'],
      plugins: [
        loadWithInlineMap(),
        buble()
      ],
      output: [{
        sourceMap: true,
        file: 'named-amd/tests.js',
        format: 'amd',
        amd: 'robot-turtle-tests'
      }]
    }
  });

  const qunitTests = new Funnel(path.dirname(require.resolve('qunitjs')), {
    annotation: 'tests/qunit.{js,css}',
    destDir: 'tests',
    files: ['qunit.css', 'qunit.js']
  });

  const loader = new Funnel(path.dirname(require.resolve('loader.js')), {
    annotation: 'tests/loader.js',
    destDir: 'tests',
    files: ['loader.js']
  });

  const indexTests = new Funnel(__dirname + '/tests', {
    destDir: 'tests',
    files: ['index.html']
  });

  const index = new Funnel(__dirname + '/src', {
    files: ['index.html']
  });

  return new MergeTrees([
    robotTurtle,
    compiled,
    amdNamed,
    amdTests,
    qunitTests,
    loader,
    indexTests,
    index
  ], {
    annotation: 'dist'
  });
};


function loadWithInlineMap() {
  return {
    load: function (id) {
      var code = fs.readFileSync(id, 'utf8');
      var result = {
        code: code,
        map: null
      };
      var index = code.lastIndexOf(SOURCE_MAPPING_DATA_URL);
      if (index === -1) {
        return result;
      }
      result.code = code.slice(0, index);
      result.map = parseSourceMap(code.slice(index + SOURCE_MAPPING_DATA_URL.length));
      result.file = id;
      return result;
    }
  };
}

function parseSourceMap(base64) {
  return JSON.parse(new Buffer(base64, 'base64').toString('utf8'));
}