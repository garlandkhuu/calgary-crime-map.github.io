function changeTxt() {
    document.getElementById('about').innerHTML = 'Changed';
}
//Test force II
var app = angular.module('knowledge', []);
app.controller('infoCtrl', function($scope){
    $scope.firstName = "Jason";
    $scope.lastName = "Dam";
    $scope.display = function(input) {
        if (input == 'first name'){
            txt = firstName;
            return $scope.firstName;
        } else {
            return "Nothing is here";
        }
    }
})