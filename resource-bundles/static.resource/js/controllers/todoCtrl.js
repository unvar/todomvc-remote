/*global angular */

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */
angular.module('todomvc')
	.controller('TodoCtrl', function TodoCtrl($scope, $routeParams, todoStorageSfdc, filterFilter) {
		'use strict';

		$scope.todos = [];
		todoStorageSfdc.get(function(err, data) {
      $scope.$apply(function() {
        if (err) {
          $scope.showMessage = true;
          $scope.message = err.message;
        } else {
          $scope.todos = data;
        }
      });
		});

		$scope.newTodo = '';
		$scope.editedTodo = null;
    $scope.message = '';
    $scope.showMessage = false;

		$scope.$watch('todos', function (newValue, oldValue) {
			$scope.remainingCount = filterFilter($scope.todos, { completed: false }).length;
			$scope.completedCount = $scope.todos.length - $scope.remainingCount;
			$scope.allChecked = !$scope.remainingCount;
		}, true);

		// Monitor the current route for changes and adjust the filter accordingly.
		$scope.$on('$routeChangeSuccess', function () {
			var status = $scope.status = $routeParams.status || '';

			$scope.statusFilter = (status === 'active') ?
				{ completed: false } : (status === 'completed') ?
				{ completed: true } : null;
		});

		$scope.addTodo = function () {
			var newTodo = $scope.newTodo.trim();
			if (!newTodo.length) {
				return;
			}

      // save todo to server
      todoStorageSfdc.put({ title: newTodo, completed: false }, function(err, todo) {
        $scope.$apply(function() {
          if (err) {
            $scope.showMessage = true;
            $scope.message = err.message;
          } else {
            $scope.todos.push(todo);  
          }          
        });
      });

			$scope.newTodo = '';
		};

		$scope.editTodo = function (todo) {
			$scope.editedTodo = todo;
			// Clone the original todo to restore it on demand.
			$scope.originalTodo = angular.extend({}, todo);
		};

		$scope.doneEditing = function (todo) {
			$scope.editedTodo = null;
			todo.title = todo.title.trim();

			if (!todo.title) {
				$scope.removeTodo(todo);
			} else {
        // save todo to server
        todoStorageSfdc.put(todo, function(err) {
          $scope.$apply(function() {
            if (err) {
              $scope.showMessage = true;
              $scope.message = err.message;
            }          
          });
        });        
      }
		};

		$scope.revertEditing = function (todo) {
			$scope.todos[$scope.todos.indexOf(todo)] = $scope.originalTodo;
			$scope.doneEditing($scope.originalTodo);
		};

		$scope.removeTodo = function (todo) {
      todoStorageSfdc.remove(todo, function(err) {
        $scope.$apply(function() {
          if (err) {
            $scope.showMessage = true;
            $scope.message = err.message;
          } else {
            $scope.todos.splice($scope.todos.indexOf(todo), 1);
          }
        });
      });
		};

    $scope.toggleTodo = function($event, id) {
      var toToggle = filterFilter($scope.todos, { Id: id })[0];      
      toToggle.completed = !toToggle.completed;
      todoStorageSfdc.put(toToggle, function(todo) {});      
    };

		$scope.clearCompletedTodos = function () {
			$scope.todos = $scope.todos.filter(function (val) {
				return !val.completed;
			});
		};

		$scope.markAll = function (completed) {
      /*
			$scope.todos.forEach(function (todo) {
				todo.completed = !completed;
			});
      */
		};
	});
