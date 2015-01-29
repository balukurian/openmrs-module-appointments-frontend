'use strict';

angular.module('bahmni.clinical').factory('visitSummaryInitialization',
    ['visitService',
        function (visitService) {

            return function (visitUuid) {
                var getVisit = function () {
                    return visitService.getVisitSummary(visitUuid).then(function (visitSummaryResponse) {
                        return visitSummaryResponse.data;
                    });
                };
                return getVisit();
            }
        }]
);
