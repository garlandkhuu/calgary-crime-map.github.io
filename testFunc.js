function changeTxt() {
    document.getElementById('about').innerHTML = 'Changed';
}
//Test force
var app = angular.module('knowledge', []);
app.controller('infoCtrl', function($scope){
    $scope.firstName = "Jason";
    $scope.lastName = "Dam";
    $scope.display = function(input) {
        var txt;
        if (input == 'first name'){
            txt = firstName;
        }
        return $scope.txt;
    }
})