import '../extjs/resources/css/ext-all-gray.css';
import './css/style.css';
import './css/meringue.css';
import 'd2-analysis/css/ui/GridHeaders.css';

import arrayTo from 'd2-utilizr/lib/arrayTo';

import { createChart } from 'd2-charts-api';

import { api, table, manager, config, ui, init, override, ux } from 'd2-analysis';

import { Dimension } from './api/Dimension';
import { Layout } from './api/Layout';
import { InstanceManager } from './manager/InstanceManager';

import { AggregateLayoutWindow } from './ui/AggregateLayoutWindow';
import { AggregateOptionsWindow } from './ui/AggregateOptionsWindow';

// override
override.extOverrides();

// extend
api.Dimension = Dimension;
api.Layout = Layout;
manager.InstanceManager = InstanceManager;

// references
var refs = {
    api,
    table
};

    // dimension config
var dimensionConfig = new config.DimensionConfig();
refs.dimensionConfig = dimensionConfig;

    // option config
var optionConfig = new config.OptionConfig();
refs.optionConfig = optionConfig;

    // period config
var periodConfig = new config.PeriodConfig();
refs.periodConfig = periodConfig;

    // chart config
var chartConfig = new config.ChartConfig();
refs.chartConfig = chartConfig;

    // ui config
var uiConfig = new config.UiConfig();
refs.uiConfig = uiConfig;

    // app manager
var appManager = new manager.AppManager();
appManager.sessionName = 'eventchart';
appManager.apiVersion = 26;
refs.appManager = appManager;

    // calendar manager
var calendarManager = new manager.CalendarManager(refs);
refs.calendarManager = calendarManager;

    // request manager
var requestManager = new manager.RequestManager(refs);
refs.requestManager = requestManager;

    // i18n manager
var i18nManager = new manager.I18nManager(refs);
refs.i18nManager = i18nManager;

    // sessionstorage manager
var sessionStorageManager = new manager.SessionStorageManager(refs);
refs.sessionStorageManager = sessionStorageManager;

    // indexeddb manager
var indexedDbManager = new manager.IndexedDbManager(refs);
refs.indexedDbManager = indexedDbManager;

    // ui manager
var uiManager = new manager.UiManager(refs);
refs.uiManager = uiManager;

    // instance manager
var instanceManager = new manager.InstanceManager(refs);
refs.instanceManager = instanceManager;

    // table manager
var tableManager = new manager.TableManager(refs);
instanceManager.apiResource = 'eventChart';
instanceManager.apiEndpoint = 'eventCharts';
instanceManager.apiModule = 'dhis-web-event-visualizer';
instanceManager.dataStatisticsEventType = 'EVENT_CHART_VIEW';
refs.instanceManager = instanceManager;

// dependencies
uiManager.setInstanceManager(instanceManager);
dimensionConfig.setI18nManager(i18nManager);
optionConfig.setI18nManager(i18nManager);
periodConfig.setI18nManager(i18nManager);
uiManager.setI18nManager(i18nManager);

    // init ux
Object.keys(ux).forEach(key => ux[key](refs));

    // klass
Object.keys(api).forEach(key => api[key].refs = refs);

// requests
var manifestReq = $.ajax({
    url: 'manifest.webapp',
    dataType: 'text',
    headers: {
        'Accept': 'text/plain; charset=utf-8'
    }
});

var systemInfoUrl = '/system/info.json';
var systemSettingsUrl = '/systemSettings.json?key=keyCalendar&key=keyDateFormat&key=keyAnalysisRelativePeriod&key=keyHideUnapprovedDataInAnalytics&key=keyAnalysisDigitGroupSeparator';
var userAccountUrl = '/api/me/user-account.json';

manifestReq.done(function(text) {
    appManager.manifest = JSON.parse(text);
    appManager.env = process.env.NODE_ENV;
    appManager.setAuth();
    appManager.logVersion();

    var systemInfoReq = $.getJSON(appManager.getApiPath() + systemInfoUrl);

systemInfoReq.done(function(systemInfo) {
    appManager.systemInfo = systemInfo;
    appManager.path = systemInfo.contextPath;

    var systemSettingsReq = $.getJSON(appManager.getApiPath() + systemSettingsUrl);

systemSettingsReq.done(function(systemSettings) {
    appManager.systemSettings = systemSettings;

    var userAccountReq = $.getJSON(appManager.getPath() + userAccountUrl);

userAccountReq.done(function(userAccount) {
    appManager.userAccount = userAccount;
    calendarManager.setBaseUrl(appManager.getPath());
    calendarManager.setDateFormat(appManager.getDateFormat());
    calendarManager.init(appManager.systemSettings.keyCalendar);

requestManager.add(new api.Request(refs, init.i18nInit(refs)));
requestManager.add(new api.Request(refs, init.authViewUnapprovedDataInit(refs)));
requestManager.add(new api.Request(refs, init.rootNodesInit(refs)));
requestManager.add(new api.Request(refs, init.organisationUnitLevelsInit(refs)));
requestManager.add(new api.Request(refs, init.legendSetsInit(refs)));
requestManager.add(new api.Request(refs, init.optionSetsInit(refs)));
requestManager.add(new api.Request(refs, init.dimensionsInit(refs, ['filter=dimensionType:eq:ORGANISATION_UNIT_GROUP_SET'])));
requestManager.add(new api.Request(refs, init.dataApprovalLevelsInit(refs)));

requestManager.set(initialize);
requestManager.run();

});});});});

function initialize() {

    // i18n init
    var i18n = i18nManager.get();

    optionConfig.init();
    dimensionConfig.init();
    periodConfig.init();

    // ui config
    uiConfig.checkout('tracker');

    // app manager
    appManager.appName = i18n.event_visualizer || 'Event Visualizer';

    // instance manager
    instanceManager.setFn(function(layout) {
        var response = layout.getResponse();

        var afterLoad = function() {

            // mask
            uiManager.unmask();

            // statistics
            instanceManager.postDataStatistics();
        };

        var el = uiManager.getUpdateComponent().body.id;
        var response = layout.getResponse();

        var { chart } = createChart(response, layout, el);

        // reg
        uiManager.reg(chart, 'chart');

        afterLoad();
    });

    // ui manager
    uiManager.disableRightClick();

    uiManager.enableConfirmUnload();

    //uiManager.setIntroFn(function() {
        //if (appManager.userFavorites.length) {
            //setTimeout(function() {
                //appManager.userFavorites.forEach(function(favorite) {
                    //Ext.get('favorite-' + favorite.id).addListener('click', function() {
                        //instanceManager.getById(favorite.id, null, true);
                    //});
                //});
            //}, 0);
        //}
    //});

    uiManager.setIntroHtml(function() {
        return '<div class="ns-viewport-text" style="padding:20px">' +
            '<h3>' + i18nManager.get('example1') + '</h3>' +
            '<div>- ' + i18nManager.get('example2') + '</div>' +
            '<div>- ' + i18nManager.get('example3') + '</div>' +
            '<div>- ' + i18nManager.get('example4') + '</div>' +
            '<h3 style="padding-top:20px">' + i18nManager.get('example5') + '</h3>' +
            '<div>- ' + i18nManager.get('example6') + '</div>' +
            '<div>- ' + i18nManager.get('example7') + '</div>' +
            '<div>- ' + i18nManager.get('example8') + '</div>' +
            '</div>';
    }());

    // windows
    var aggregateLayoutWindow = uiManager.reg(AggregateLayoutWindow(refs), 'aggregateLayoutWindow').hide();

    var aggregateOptionsWindow = uiManager.reg(AggregateOptionsWindow(refs), 'aggregateOptionsWindow').hide();

    uiManager.reg(ui.FavoriteWindow(refs), 'favoriteWindow').hide();

    // viewport
    var northRegion = uiManager.reg(ui.NorthRegion(refs), 'northRegion');

    var eastRegion = uiManager.reg(ui.EastRegion(refs), 'eastRegion');

    var westRegionItems = uiManager.reg(ui.WestRegionTrackerItems(refs), 'accordion');

    var chartTypeToolbar = uiManager.reg(ui.ChartTypeToolbar(refs), 'chartTypeToolbar');

    var defaultIntegrationButton = uiManager.reg(ui.IntegrationButton(refs, {
        isDefaultButton: true,
        btnText: i18n.table,
        btnIconCls: 'ns-button-icon-table'
    }), 'defaultIntegrationButton');

    var chartIntegrationButton = ui.IntegrationButton(refs, {
        objectName: 'event-chart',
        moduleName: 'dhis-web-event-visualizer',
        btnIconCls: 'ns-button-icon-chart',
        btnText: i18n.chart,
        menuItem1Text: i18n.go_to_event_charts,
        menuItem2Text: i18n.open_this_table_as_chart,
        menuItem3Text: i18n.open_last_chart
    });

    // viewport
    uiManager.reg(ui.Viewport(refs, {
        northRegion: northRegion,
        eastRegion: eastRegion,
        westRegionItems: westRegionItems,
        chartTypeToolbar: chartTypeToolbar,
        integrationButtons: [
            defaultIntegrationButton,
            chartIntegrationButton
        ],
        DownloadButtonItems: ui.ChartDownloadButtonItems,
    }, {
        getLayoutWindow: () => aggregateLayoutWindow,
        getOptionsWindow: () => aggregateOptionsWindow
    }), 'viewport');
}

global.refs = refs;
