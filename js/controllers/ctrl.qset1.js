(function () {
    "use strict";

    angular.module('myApp').controller("QuestionSetOneCtrl", ["$rootScope", "$scope",
        "$location", "jBufiDataSer", "$firebaseAuth", "$firebaseArray", QuestionSetOneCtrlClass]);

    function QuestionSetOneCtrlClass($rootScope, $scope, $location, jBufiDataSer, $firebaseAuth, $firebaseArray) {
        var vm = this;
        vm.message = "QuestionSetOneCtrl wired up!";

        var ref = firebase.database().ref();
        var auth = $firebaseAuth();

        $scope.score = 0;
        $scope.activeQuestion = -1;
        $scope.activeQuestionAnswered = 0;
        $scope.percentScore = 0;

        activate();
        setActiveQuestion();

        $scope.seeMatchesUnauth = function () {
            if (!$rootScope.currentUser) {
                $location.url("/register");
            } else {
                $location.url("/matches");
            }

            var dislikes = dislikesInfoAR.$keyAt(1);

            console.log("BuddyMatch.me - entire dislikes array for this user:");
            console.log(dislikesInfoAR);
            $rootScope.matchesAlgo = "Sorry, I didn't complete this algorithm :'( ";
        };

        auth.$onAuthStateChanged(function (authUser) {
            if (authUser) {
                var matchesRef = ref.child('users').child(authUser.uid);//.child('dislikes');
                var dislikesRef = matchesRef.child("dislikes");
                var matchesInfo = $firebaseArray(matchesRef);
                var dislikesInfoAR = $firebaseArray(dislikesRef);
                $scope.meetings = matchesInfo;
                var allUsers;

                $firebaseArray(ref.child('users')).$loaded().then(function (res) {
                    var allUsersArray = [];
                    console.log("jha - res = ");
                    console.log(res.length);
                    for (var i = 0; i < res.length; i++) {
                        allUsersArray[i] = res[i];
                    }
                    allUsers = allUsersArray;
                });

                $scope.seeMatches = function () {
                    if (!$rootScope.currentUser) {
                        $location.url("/register");
                    }
                    $location.url("/matches");
                    // var dislikes = matchesInfo.$keyAt(1);
                    console.log("BuddyMatch.me - dislikes = ");
                    console.log("BuddyMatch.me - entire dislikes array for this user:");
                    console.log(dislikesInfoAR);
                    $rootScope.matchesAlgo = "Sorry, I didn't complete this algorithm :'( ";
                };
            }

            $scope.selectAnswer = function (indexQuestion, indexAnswer) {
                $scope.userAnswer = $scope.myQuestions[indexQuestion].answers[indexAnswer].text;

                if (dislikesInfoAR) {
                    dislikesInfoAR.$add({
                        question: $scope.myQuestions[indexQuestion].question,
                        answer: $scope.myQuestions[indexQuestion].answers[indexAnswer].text
                    });
                }

                var questionState = $scope.myQuestions[indexQuestion].questionState;

                if (questionState !== 'answered') { // .questionState is falsey because user has yet to click on an answer
                    $scope.myQuestions[indexQuestion].selectedAnswer = indexAnswer;
                    var correctAnswer = $scope.myQuestions[indexQuestion].correct;
                    $scope.myQuestions[indexQuestion].correctAnswer = correctAnswer;

                    if (indexAnswer === correctAnswer) {
                        $scope.myQuestions[indexQuestion].correctness = 'correct';
                        $scope.score += 1;
                    } else {
                        $scope.myQuestions[indexQuestion].correctness = 'incorrect';
                    }
                    // now that user has clicked on an answer I now set .questionState
                    $scope.myQuestions[indexQuestion].questionState = 'answered';
                }

                $scope.percentScore = (100 * ($scope.score / $scope.totalQuestions))
                    .toFixed(2);
            };

            $scope.isSelected = function (qIndex, aIndex) {
                return $scope.myQuestions[qIndex].selectedAnswer === aIndex;
            };

            $scope.isCorrect = function (qIndex, aIndex) {
                return $scope.myQuestions[qIndex].correctAnswer === aIndex;
            };

            $scope.selectContinue = function () {
                return $scope.activeQuestion += 1;
            };
        });

        $scope.createShareLinks = function (percent) {
            var url = 'http://php1.julius3d.com';
            var emailLink = '<a href="mailto:?subject=Quiz Score.&amp;body=Beat my ' + percent +
                '% quiz score at ' + url + ' studios." class="btn btn-sm btn-warning email">Email</a>';
            var tweetLink = '<a href="http://twitter.com/share?text=I scored ' + percent + ' on my AngularJS quiz. ' +
                'Beat my score at &hashtags=ngQuiz&url=' + url + '" target="_blank" class="btn btn-sm btn-info twitter">Tweet</a>';

            var newMarkup = emailLink + tweetLink;
            return $sce.trustAsHtml(newMarkup);
        };

        function setActiveQuestion() {
            $scope.activeQuestion = 0;
        }

        function activate() {
            jBufiDataSer.getLocalData().then(function (res) {
                $scope.myQuestions = res.data;
                $scope.totalQuestions = $scope.myQuestions.length;
            });
        }
    }
})();