function changeTxt() {
    document.getElementById('about').innerHTML = 'Changed';
}

var app = angular.module('knowledge'. []);
app.controller('infoCtrl', function($scope){
    $scope.firstName = "Jason";
    $scope.lastName = "Dam";
    $scope.display = function() {
        return $scope.feedBck;
    }
})