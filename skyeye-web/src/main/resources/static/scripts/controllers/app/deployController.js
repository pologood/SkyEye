/**
 * the app deploy controller
 *
 * @author JThink
 */
define(['controllers/controllers', 'common/util','common/constant', 'services/dataService'], function(controllers, util, constant) {
  'use strict';
  controllers.controller('DeployController', ['$scope', 'DataService', function($scope, DataService) {

    var gHostApps = {};

    var gIsApp = false;

    var renderAppInfo = function() {
      $('#app-deploy-table').parent().addClass('loading');
      var params = {
        url: 'app/deployHost',
        host: typeof($scope.selectedHost) === 'undefined' ? null : $scope.selectedHost,
        app: typeof($scope.selectedApp) === 'undefined' ? null : $scope.selectedApp
      };
      if (gIsApp) {
        params = {
          url: 'app/deployApp',
          app: typeof($scope.selectedHost) === 'undefined' ? null : $scope.selectedHost,
          host: typeof($scope.selectedApp) === 'undefined' ? null : $scope.selectedApp
        };
      }
      DataService.getData(params, function(data) {
        $('.no-data-div span').remove();
        $('#app-deploy-table').parent().removeClass('loading');
        if (data.resCode === constant.resCodeSuccess && data.statCode === constant.statCodeSuccess) {
          var appInfos = data.data;
          if (null == appInfos || appInfos.length === 0) {
            $('.no-data-div').append('<span class="no-data">' + '没有数据' + '</span>');
            $scope.appInfos = [];
            $('.pagination').addClass('hidden');
          } else {
               $('.pagination').removeClass('hidden');
               // pagination
               $scope.appInfos = util.pagination(appInfos, 1, constant.pageSize);
               $scope.pageSize = constant.pageSize;
               $scope.totalItems = appInfos.length;
               $scope.currentPage = constant.currentPage;
               $scope.maxSize = constant.maxSize;
               $scope.pageChanged = function() {
                 $scope.appInfos = util.pagination(appInfos, $scope.currentPage, constant.pageSize);
               };
              $scope.converterUploadDate = util.converterUploadDate;
              $scope.converterMsgType= util.converterMsgType;
          }
        } else {
          // TODO: exception
        }
      });
    };

    var renderHost = function() {
      var params = {
        url: 'app/hostApp',
        type: constant.zkNodeTypePersistent
      };
      if (gIsApp) {
        params = {
          url: 'app/appHost',
          type: constant.zkNodeTypePersistent
        };
      }
      DataService.getData(params, function(data) {
        var hostApps = data.data;
        gHostApps = hostApps;
        var hosts = Object.keys(hostApps);
        $scope.hosts = hosts;
      });
    };

    var renderApp = function(host) {
      var apps = gHostApps[host];
      $scope.apps = apps;
    };

    var initData = function() {
      // render the app info to table
      renderAppInfo();
      renderHost();
      changeShowSelect();
    };

    var hostChange = function() {
      var host = $scope.selectedHost;
      if (gIsApp) {
        $scope.selectedApp = '请选择host';
      } else {
        $scope.selectedApp = '请选择app';
      }
      renderApp(host);
      // call backend
      renderAppInfo();
    };

    var appChange = function() {
      var app = $scope.selectedApp;
      // call backend
      renderAppInfo();
    };

    var changeShowSelect = function() {
      if (gIsApp) {
        $scope.firstSelect = 'app'
        $scope.secondSelect = 'host'
      } else {
        $scope.firstSelect = 'host'
        $scope.secondSelect = 'app'
      }
    };

    var reverse = function() {
      gIsApp = !gIsApp;
      renderHost();
      changeShowSelect();
      if (gIsApp) {
        $scope.selectedHost = '请选择app';
        $scope.selectedApp = '请选择host';
      } else {
        $scope.selectedHost = '请选择host';
        $scope.selectedApp = '请选择app';
      }
      renderAppInfo();
    };

    var initEvent = function() {
      // bind the event
      $scope.hostChange = hostChange;
      $scope.appChange = appChange;
      $scope.reverse = reverse;
    };

    initData();

    initEvent();
  }]);
});