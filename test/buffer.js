var vows = require('vows');
var assert = require('assert');
var Buffer = require('../lib/html5/buffer').Buffer;
var HTML5 = require('../lib/html5');

vows.describe('buffer').addBatch({
	'Buffer without eof': {
		topic: function() {
		  var buf = new Buffer();
		  buf.append('<html></html>');
		  return buf;
		},
		'should peek without advancing': function(buf) {
			assert.equal(buf.peek(1), '<');
			assert.equal(buf.peek(2), '<h');
			assert.equal(buf.peek(buf.length()), '<html></html');
		},
		'should give length': function(buf) {
			assert.equal(buf.length(), 12);
		},
		'should throw when peeking off the end': function(buf) {
			assert.throws(function(){return buf.peek(buf.length() + 1)});
		},
	},
	'Buffer with eof': {
		topic: function() {
		  var buf = new Buffer();
		  buf.append('<html></html>');
		  buf.eof = true;
		  return buf;
		},
		'should give full length': function(buf) {
			assert.equal(buf.length(), 13);
		},
		'should return NUL-terminated string': function(buf) {
			assert.equal(buf.peek(buf.length() + 1), '<html></html>\0');
			assert.equal(buf.peek(buf.length() + 2), '<html></html>\0');
		},
	},
	'Buffer appended to multiple times': {
		topic: function() {
		  var buf = new Buffer();
		  buf.append('<html>');
		  buf.append('</html>');
		  buf.eof = true;
		  return buf;
		},
		'should contain everything': function(buf) {
			assert.equal(buf.length(), 13);
			assert.equal(buf.peek(buf.length()), '<html></html>');
		},
		'supports advance, undo, and commit': function(buf) {
		  assert.equal(buf.peek(2), '<h');
		  buf.advance(2);
		  assert.equal(buf.peek(1), 't');
			assert.equal(buf.char(), 't');
		  assert.equal(buf.peek(2), 'ml');
		  buf.unget('ht')
			assert.equal(buf.peek(4), 'html');
		  buf.undo();
		  assert.equal(buf.peek(2), '<h');
		  buf.advance(6);
		  assert.equal(buf.peek(5), '</htm');
		  buf.commit();
		  assert.equal(buf.peek(5), '</htm');
		  buf.undo();
		  assert.equal(buf.peek(5), '</htm');
		},
	},
	'Another buffer': {
		topic: function() {
		  var buf = new Buffer();
		  buf.append(' sometext');
		  buf.append('  \t\n with spaces   ');
		  buf.append('. the end.');
		  buf.eof = true;
		  return buf;
		},
		'matchWhile should advance': function(buf) {
			assert.equal(buf.matchWhile(HTML5.SPACE_CHARACTERS_R), ' ');
			assert.equal(buf.peek(8), 'sometext');
			assert.equal(buf.matchWhile(HTML5.ASCII_LETTERS), 'sometext');
			assert.equal(buf.matchWhile(HTML5.ASCII_LETTERS), '');
		},
		'matchUntil should reject regexp': function(buf) {
		  assert.throws(function() {return buf.matchUntil(HTML5.SPACE_CHARACTERS_R)});
		},
		'matchUntil should advance': function(buf) {
			assert.equal(buf.matchUntil(HTML5.ASCII_LETTERS), '  \t\n ');
			assert.equal(buf.matchUntil(HTML5.ASCII_LETTERS), '');
			assert.equal(buf.peek(4), 'with');
			assert.equal(buf.matchUntil(HTML5.SPACE_CHARACTERS), 'with');
			assert.equal(buf.matchUntil(HTML5.SPACE_CHARACTERS), '');
		},
		'matchWhile should read to end with nil.': function(buf) {
			assert.equal(buf.matchWhile('.'), ' spaces   . the end.\0');
		},
	},
	'Another buffer': {
		topic: function() {
		  var buf = new Buffer();
		  buf.append(' sometext');
		  buf.append('  \t\n with spaces   ');
		  buf.append('. the end.');
		  buf.eof = true;
		  return buf;
		},
		'matchWhile should advance': function(buf) {
			assert.equal(buf.matchWhile(HTML5.SPACE_CHARACTERS_R), ' ');
			assert.equal(buf.peek(8), 'sometext');
			assert.equal(buf.matchWhile(HTML5.ASCII_LETTERS), 'sometext');
			assert.equal(buf.matchWhile(HTML5.ASCII_LETTERS), '');
		},
		'matchUntil should reject regexp': function(buf) {
		  assert.throws(function() {return buf.matchUntil(HTML5.SPACE_CHARACTERS_R)});
		},
		'matchUntil should advance': function(buf) {
			assert.equal(buf.matchUntil(HTML5.ASCII_LETTERS), '  \t\n ');
			assert.equal(buf.matchUntil(HTML5.ASCII_LETTERS), '');
			assert.equal(buf.peek(4), 'with');
			assert.equal(buf.matchUntil(HTML5.SPACE_CHARACTERS), 'with');
			assert.equal(buf.matchUntil(HTML5.SPACE_CHARACTERS), '');
		},
		'matchWhile should read to end with nil.': function(buf) {
			assert.equal(buf.matchWhile('.'), ' spaces   . the end.\0');
		},
	},
	'Third buffer': {
		topic: function() {
		  var buf = new Buffer();
		  buf.append('abcdefghijklmnopqrstuvwxyz');
		  return buf;
		},
		'Should throw if entering insert mode while not committed': function(buf) {
		  buf.advance(3);
		  assert.throws(function() {buf.insertModeBegin();});
		  assert.equal(buf.inserting, false);
		  buf.commit();
		},
		'Should throw if insert() while not in insert mode.': function(buf) {
		  assert.equal(buf.peek(3), 'def');
		  assert.throws(function() {buf.insert('hi');});
		  assert.equal(buf.peek(3), 'def');
		},
		'Insert mode': function(buf) {
		  assert.equal(buf.peek(3), 'def');
		  buf.insertModeBegin();
		  buf.insert('hello');
		  buf.insertModeEnd();
		  assert.equal(buf.peek(8), 'hellodef');
		},
	},
}).export(module)

