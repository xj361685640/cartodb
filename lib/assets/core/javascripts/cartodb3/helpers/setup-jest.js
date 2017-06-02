const JSDOM = require('jsdom').JSDOM;

const documentHTML = '<!doctype html><html><body><div id="root"></div></body></html>';
const dom = new JSDOM(documentHTML);
global.window = dom.window;
global.document = dom.window.document;
global.navigator = {
  userAgent: 'node.js'
};

global.L = require('leaflet');

var fs = require('fs');
var vm = require('vm');

var globalContext = vm.createContext(global);

const content = fs.readFileSync('node_modules/cartodb.js/vendor/wax.cartodb.js');
vm.runInContext(content, globalContext, { filename: 'wax.cartodb.js' });

class LocalStorageMock {
  constructor () {
    this.store = {};
  }

  clear () {
    this.store = {};
  }

  getItem (key) {
    return this.store[key];
  }

  setItem (key, value) {
    this.store[key] = value.toString();
  }

  removeItem (key) {
    delete this.store[key];
  }
}

Object.defineProperty(window, 'localStorage', { value: LocalStorageMock });
Object.defineProperty(window, '_t', { value: () => {} });
Object.defineProperty(window, 'jQuery', { value: require('jquery') });
// global.wax = require('../../../../../../node_modules/cartodb.js/vendor/wax.cartodb.js');

