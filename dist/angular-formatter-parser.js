/**
 * Angular formatter and parser framework
 * @version v0.1.0 - 2014-02-25
 * @link https://github.com/loosebits/angular-formatter-parser
 * @author Rand McNeely <loosebits@gmail.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */

(function(angular, undefined) {
'use strict';
function createFunction($inflector, $injector, $parse, scope, ctrl, name, isParser) {
    var m = name.match(/^\s*(.+)\s*$/i);
    var dsc = {};
    if(!m || !m[1]) return; // TODO: throw.
    m = m[1].match(/^(\w[\w\d-]+)(?::(.*?))?$/);
    if (!m) return;
    dsc.fun = $injector.get($inflector.camelize(m[1], true) + (isParser ? 'Parser' : 'Formatter'));
    if (m[2]) {
        dsc.dyn = $parse(m[2]);
    }
    return function(viewValue) {
        var args = dsc.dyn ? dsc.dyn(scope, {$value: viewValue}) : [];
        if (!angular.isArray(args)) {
            args = [args];
        }
        if (isParser) {
            args.unshift(ctrl);
        }
        args.unshift(viewValue);
        return dsc.fun.apply(null, args);
    };

}

angular.module('loosebits.formatParse',['platanus.inflector'])
.directive('fpFormat',['$inflector', '$injector', '$parse' , function($inflector, $injector, $parse) {
    return {
        restrict: 'AC',
        priority: -1,
        require: 'ngModel',
        link: function(scope, element, attrs, ctrl) {
                var formatter = createFunction($inflector, $injector, $parse, scope, ctrl, attrs.fpFormat, false);
                ctrl.$formatters.push(formatter);
            }
    };
}])
.directive('fpParse',['$inflector', '$injector', '$parse' , function($inflector, $injector, $parse) {
    return {
        priority: -1,
        restrict: 'AC',
        require: 'ngModel',
        link: function(scope, element, attrs, ctrl) {
                var parser = createFunction($inflector, $injector, $parse, scope, ctrl, attrs.fpParse, true);
                ctrl.$parsers.push(parser);
            }
    };
}]);
})(angular);