/*global angular */

/**
 * Services that persists and retrieves TODOs from Salesforce.com
 */
angular.module('todomvc')
	.factory('todoStorageSfdc', function () {
		'use strict';

		// fields to be extracted from todo
		var FIELDS = 'Id title completed'.split(' ');

		// a simple toJson method for remoteObjects
		function toJson(todo) {
			var obj = {};
			FIELDS.forEach(function(field) {
				obj[field] = todo.get(field);
			});

			return obj;
		}

		return {
			get: function (cb) {
				var todo = new $RO.Todo();
				todo.retrieve({}, function(err, records) {
					if (err) {
						cb(err);
					} else {
						var todos = records.map(function(record) {
							return toJson(record);
						});
						cb(null, todos);
					}
				});
			},

			put: function (todo, cb) {
				var rec = new $RO.Todo(todo);
				if (rec.get('Id')) {
					rec.update(function(err) {
						if (err) {
							cb(err);
						} else {
							cb(null, toJson(rec));
						}
					});
				} else {
					rec.create(function(err) {
						if (err) {
							cb(err);
						} else {
							cb(null, toJson(rec));
						}
					});
				}
			},

			remove: function(todo, cb) {
				var rec = new $RO.Todo(todo);
				rec.del(function(err) {
					if (err) {
						cb(err);
					} else {
						cb(null, toJson(rec));
					}					
				});
			}
		};
	});
